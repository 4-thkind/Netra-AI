"""Cash Flow Prophet — the fitted model must recover known structure."""

import random
from datetime import datetime, timedelta, timezone

import pytest

from backend.app.analytics.forecast_model import (
    PRIOR_SEASONALITY, WEEKDAYS, fit_merchant_model,
)


def _series(days=90, base=10_000, weekend_boost=True, seed=11):
    """Synthetic history with a known weekly shape."""
    rnd = random.Random(seed)
    rows, now = [], datetime.now(timezone.utc)
    for d in range(days, 0, -1):
        day = now - timedelta(days=d)
        name = WEEKDAYS[day.weekday()]
        weight = PRIOR_SEASONALITY[name] if weekend_boost else 1.0
        revenue = base * weight * rnd.uniform(0.95, 1.05)
        for _ in range(8):
            rows.append((day, revenue / 8))
    return rows


def test_fits_and_recovers_weekly_shape():
    m = fit_merchant_model(_series())
    assert m.fitted
    assert m.r_squared > 0.5
    # We fed in a weekend-heavy kirana pattern; the model must find it.
    assert m.seasonality["Sunday"] > m.seasonality["Tuesday"]
    assert m.explain()["peak_day"] in ("Saturday", "Sunday")


def test_seasonality_is_normalised():
    m = fit_merchant_model(_series())
    mean_index = sum(m.seasonality.values()) / 7
    # Seasonality redistributes revenue across the week; it must not inflate it.
    assert 0.97 <= mean_index <= 1.03


def test_confidence_band_widens_with_horizon():
    preds = fit_merchant_model(_series()).predict(7)
    widths = [p["confidence_high"] - p["confidence_low"] for p in preds]
    assert widths[-1] > widths[0], "uncertainty must grow with distance"
    for p in preds:
        assert p["confidence_low"] <= p["projected_inflow"] <= p["confidence_high"]


def test_thin_history_does_not_fit():
    # A merchant with under two weeks of data must not get a fitted forecast.
    m = fit_merchant_model(_series(days=8))
    assert not m.fitted
    assert len(m.predict(7)) == 7   # still serves a prior-based forecast


def test_flat_series_yields_flat_trend():
    m = fit_merchant_model(_series(weekend_boost=False, seed=3))
    assert abs(m.explain()["trend_per_day"]) < 200


@pytest.mark.asyncio
async def test_endpoint_reports_model_card():
    """The API must expose how the number was produced, not just the number."""
    from httpx import ASGITransport, AsyncClient
    from backend.app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        token = (await client.get("/api/v1/auth/demo-token")).json()["access_token"]
        res = await client.get(
            "/api/v1/insights/cashflow",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert res.status_code == 200
        body = res.json()
        assert body["model"]["method"].startswith("Multiplicative decomposition")
        assert len(body["days"]) == 7
        assert body["total_projected_7d"] > 0
