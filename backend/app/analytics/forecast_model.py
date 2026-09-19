"""
Cash Flow Prophet — the actual forecasting model.

A small, interpretable time-series model fitted per merchant on their own
transaction history. Deliberately not a black box: a merchant-facing money
prediction has to be explainable, and every number here can be traced back to
a specific day of their own sales.

Method (classical multiplicative decomposition, the same shape Prophet uses):

    forecast(day) = (level + slope · t) × seasonal_index(weekday)

  1. Aggregate transactions into a daily revenue series.
  2. Fit a linear trend by ordinary least squares over the last N days.
  3. De-trend, then average by weekday to get 7 seasonal indices,
     normalised to mean 1.0.
  4. Shrink each index toward 1.0 in proportion to how little data supports it
     (James-Stein style), so a weekday seen twice cannot swing the forecast.
  5. Confidence band from the residual standard deviation of the in-sample fit,
     widening with forecast horizon.

Falls back to a prior when a merchant has too little history to fit.
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Sequence

import numpy as np

WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday",
            "Friday", "Saturday", "Sunday"]

# Indian kirana rhythm: used as the prior when a weekday has little or no
# history, and as the whole model when a merchant is brand new.
PRIOR_SEASONALITY = {
    "Monday": 0.92, "Tuesday": 0.86, "Wednesday": 0.98, "Thursday": 1.02,
    "Friday": 1.15, "Saturday": 1.35, "Sunday": 1.40,
}

MIN_DAYS_TO_FIT = 14          # below this we cannot estimate a weekly pattern
SHRINKAGE_STRENGTH = 3.0      # pseudo-observations pulling an index to prior


def build_daily_series(
    rows: Sequence[tuple], lookback_days: int = 90
) -> Dict[datetime, float]:
    """Collapse (timestamp, amount) rows into {date -> revenue}."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=lookback_days)
    daily: Dict[datetime, float] = defaultdict(float)
    for ts, amount in rows:
        if ts is None or amount is None:
            continue
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        if ts < cutoff:
            continue
        daily[ts.replace(hour=0, minute=0, second=0, microsecond=0)] += float(amount)
    return dict(daily)


class CashFlowModel:
    """Fitted per merchant. `fitted` is False when history was insufficient."""

    def __init__(self) -> None:
        self.level: float = 0.0
        self.slope: float = 0.0
        self.seasonality: Dict[str, float] = dict(PRIOR_SEASONALITY)
        self.residual_sd: float = 0.0
        self.n_days: int = 0
        self.fitted: bool = False
        self.r_squared: float = 0.0

    # -- fitting ---------------------------------------------------------
    def fit(self, daily: Dict[datetime, float]) -> "CashFlowModel":
        self.n_days = len(daily)
        if self.n_days < MIN_DAYS_TO_FIT:
            return self

        dates = sorted(daily)
        t = np.arange(len(dates), dtype=float)
        y = np.array([daily[d] for d in dates], dtype=float)

        # 1. Least-squares trend. polyfit on a degenerate series can warn, so
        #    guard the constant case explicitly.
        if np.ptp(y) == 0:
            self.slope, self.level = 0.0, float(y.mean())
        else:
            self.slope, self.level = (float(v) for v in np.polyfit(t, y, 1))

        trend = self.level + self.slope * t
        trend = np.where(trend <= 0, max(y.mean(), 1.0), trend)

        # 2. De-trend multiplicatively, then average per weekday.
        ratios = y / trend
        by_weekday: Dict[str, List[float]] = defaultdict(list)
        for d, r in zip(dates, ratios):
            by_weekday[WEEKDAYS[d.weekday()]].append(float(r))

        # 3. Shrink toward the prior: an index backed by 2 observations should
        #    barely move the forecast, one backed by 12 should dominate.
        seasonality = {}
        for name in WEEKDAYS:
            obs = by_weekday.get(name, [])
            prior = PRIOR_SEASONALITY[name]
            if obs:
                n = len(obs)
                w = n / (n + SHRINKAGE_STRENGTH)
                seasonality[name] = w * float(np.mean(obs)) + (1 - w) * prior
            else:
                seasonality[name] = prior

        # 4. Normalise so seasonality redistributes revenue without inflating it.
        mean_index = float(np.mean(list(seasonality.values()))) or 1.0
        self.seasonality = {k: v / mean_index for k, v in seasonality.items()}

        # 5. In-sample residuals drive the confidence band and R².
        fitted_vals = trend * np.array(
            [self.seasonality[WEEKDAYS[d.weekday()]] for d in dates]
        )
        residuals = y - fitted_vals
        self.residual_sd = float(np.std(residuals))
        ss_tot = float(np.sum((y - y.mean()) ** 2))
        self.r_squared = 1.0 - float(np.sum(residuals ** 2)) / ss_tot if ss_tot > 0 else 0.0

        self.fitted = True
        return self

    # -- prediction ------------------------------------------------------
    def predict(self, horizon: int = 7, start: Optional[datetime] = None) -> List[Dict[str, Any]]:
        now = start or datetime.now(timezone.utc)
        out: List[Dict[str, Any]] = []

        for i in range(1, horizon + 1):
            day = now + timedelta(days=i)
            name = WEEKDAYS[day.weekday()]
            index = self.seasonality.get(name, 1.0)

            base = self.level + self.slope * (self.n_days + i) if self.fitted else self.level
            point = max(0.0, base * index)

            # Uncertainty grows with horizon: sd · sqrt(step) is the standard
            # random-walk widening, and ~1.28 sd is an 80% interval.
            spread = self.residual_sd * np.sqrt(i) * 1.28 if self.fitted else point * 0.09
            low, high = max(0.0, point - spread), point + spread

            out.append({
                "date": day.strftime("%Y-%m-%d"),
                "day_name": name,
                "projected_inflow": round(point),
                "confidence_low": round(low),
                "confidence_high": round(high),
                "seasonal_index": round(index, 3),
                # Flag the days that sit meaningfully below the weekly average,
                # since those are the ones that cause a settlement to bounce.
                "risk_level": "warning" if index < 0.90 else "normal",
            })
        return out

    def explain(self) -> Dict[str, Any]:
        """Model card for the UI — never present a money forecast unexplained."""
        peak = max(self.seasonality, key=self.seasonality.get)
        trough = min(self.seasonality, key=self.seasonality.get)
        return {
            "method": "Multiplicative decomposition (OLS trend + shrunk weekday seasonality)",
            "fitted_on_days": self.n_days,
            "is_fitted": self.fitted,
            "trend_per_day": round(self.slope, 2),
            "trend_direction": "growing" if self.slope > 0 else ("declining" if self.slope < 0 else "flat"),
            "r_squared": round(self.r_squared, 3),
            "residual_sd": round(self.residual_sd, 2),
            "peak_day": peak,
            "slowest_day": trough,
            "seasonality": {k: round(v, 3) for k, v in self.seasonality.items()},
        }


def fit_merchant_model(rows: Sequence[tuple], lookback_days: int = 90) -> CashFlowModel:
    return CashFlowModel().fit(build_daily_series(rows, lookback_days))


def _demo() -> None:
    """Self-check: a synthetic series with known shape must be recovered."""
    import random
    random.seed(7)
    rows = []
    now = datetime.now(timezone.utc)
    for d in range(90, 0, -1):
        day = now - timedelta(days=d)
        weight = PRIOR_SEASONALITY[WEEKDAYS[day.weekday()]]
        revenue = 10_000 * weight * random.uniform(0.95, 1.05)
        for _ in range(8):
            rows.append((day, revenue / 8))

    m = fit_merchant_model(rows)
    assert m.fitted, "should fit on 90 days"
    assert m.n_days >= 85, m.n_days

    # Weekend must come out above weekdays — the shape we fed in.
    assert m.seasonality["Sunday"] > m.seasonality["Tuesday"], m.seasonality
    assert m.r_squared > 0.5, f"poor fit: R²={m.r_squared}"

    preds = m.predict(7)
    assert len(preds) == 7
    assert all(p["confidence_low"] <= p["projected_inflow"] <= p["confidence_high"] for p in preds)
    # Bands must widen with horizon.
    w = [p["confidence_high"] - p["confidence_low"] for p in preds]
    assert w[-1] > w[0], w

    # Too little history -> unfitted, but still returns a usable prior forecast.
    thin = fit_merchant_model(rows[-16:])
    assert not thin.fitted
    assert len(thin.predict(7)) == 7

    print(f"OK  fitted={m.n_days}d  R²={m.r_squared:.3f}  "
          f"peak={m.explain()['peak_day']}  trend={m.explain()['trend_direction']}")


if __name__ == "__main__":
    _demo()
