from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
import random

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.analytics.forecast_model import fit_merchant_model
from backend.app.models.transactions import Transaction


class CashFlowProphetEngine:
    """
    Section 20: 7-Day Cash Flow Forecasting.

    `forecast_from_history` is the real path: it fits a per-merchant model on
    that merchant's own transactions (see forecast_model.py).
    `generate_7day_projection` is the synthetic fallback, kept for callers
    without a database session and for merchants with too little history.
    """

    @staticmethod
    async def forecast_from_history(
        db: AsyncSession, merchant_id: str, lookback_days: int = 90
    ) -> Dict[str, Any]:
        """Fit on the merchant's own history and forecast the next 7 days."""
        stmt = select(Transaction.timestamp, Transaction.amount).where(
            Transaction.merchant_id == merchant_id
        )
        rows = (await db.execute(stmt)).all()

        model = fit_merchant_model(rows, lookback_days=lookback_days)

        # Not enough history to estimate a weekly pattern - fall back rather
        # than show a merchant a forecast built on four days of data.
        if not model.fitted:
            out = CashFlowProphetEngine.generate_7day_projection(merchant_id)
            out["model"] = {
                **model.explain(),
                "note": "Insufficient history to fit; showing category baseline.",
            }
            return out

        days = model.predict(7)
        total = float(sum(d["projected_inflow"] for d in days))
        explain = model.explain()

        peak = max(days, key=lambda d: d["projected_inflow"])
        dip = min(days, key=lambda d: d["projected_inflow"])

        return {
            "period": "Next 7 Days",
            "total_projected_7d": total,
            "risk_summary": (
                f"Fitted on {explain['fitted_on_days']} days of your own sales "
                f"(R²={explain['r_squared']}). Revenue trend is {explain['trend_direction']}. "
                f"Expect a {dip['day_name']} dip of about ₹{dip['projected_inflow']:,}, "
                f"covered by {peak['day_name']} at ₹{peak['projected_inflow']:,}."
            ),
            "recommended_action": (
                f"Schedule major distributor settlements for {peak['day_name']}, "
                f"your strongest inflow day, and keep {dip['day_name']} light."
            ),
            "days": days,
            "model": explain,
        }

    @staticmethod
    def _legacy_marker() -> None:  # pragma: no cover - documentation anchor
        """The method below predates the fitted model; see class docstring."""
    @staticmethod
    def generate_7day_projection(merchant_id: str, baseline_daily: float = 9500.0) -> Dict[str, Any]:
        days = []
        now = datetime.now(timezone.utc)
        
        # Day of week multiplier (Sunday/Saturday higher in Indian kiranas, Tuesday slightly slower)
        dow_weights = {
            "Monday": 0.92,
            "Tuesday": 0.86,
            "Wednesday": 0.98,
            "Thursday": 1.02,
            "Friday": 1.15,
            "Saturday": 1.35,
            "Sunday": 1.40
        }

        total_inflow = 0.0
        for i in range(1, 8):
            day_dt = now + timedelta(days=i)
            day_name = day_dt.strftime("%A")
            weight = dow_weights.get(day_name, 1.0)
            
            projected = baseline_daily * weight
            noise = projected * random.uniform(-0.04, 0.04)
            projected = round(projected + noise, 0)
            
            low = round(projected * 0.91, 0)
            high = round(projected * 1.09, 0)
            total_inflow += projected

            risk = "warning" if weight < 0.90 else "normal"

            days.append({
                "date": day_dt.strftime("%Y-%m-%d"),
                "day_name": day_name,
                "projected_inflow": projected,
                "confidence_low": low,
                "confidence_high": high,
                "risk_level": risk
            })

        return {
            "period": "Next 7 Days",
            "total_projected_7d": total_inflow,
            "risk_summary": "Stable working capital. Expected Tuesday liquidity dip easily covered by weekend inflows.",
            "recommended_action": "Schedule major wholesale distributor settlements for Saturday afternoon.",
            "days": days
        }

cashflow_engine = CashFlowProphetEngine()
