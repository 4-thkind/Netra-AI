import pytest
from backend.app.analytics.cashflow import cashflow_engine
from backend.app.analytics.festival import festival_engine
from backend.app.analytics.growth_missions import growth_mission_engine

def test_cashflow_7day_forecast():
    forecast = cashflow_engine.generate_7day_projection("merchant_ramesh")
    assert forecast["period"] == "Next 7 Days"
    assert len(forecast["days"]) == 7
    assert forecast["total_projected_7d"] > 0
    for day in forecast["days"]:
        assert day["confidence_low"] <= day["projected_inflow"] <= day["confidence_high"]
        assert day["risk_level"] in ["normal", "low", "warning"]

def test_festival_engine():
    alerts = festival_engine.get_upcoming_festivals()
    assert len(alerts) > 0
    alert = alerts[0]
    assert "festival_name" in alert
    assert "recommended_stock" in alert
    assert len(alert["recommended_stock"]) > 0

@pytest.mark.asyncio
async def test_growth_missions_are_derived_not_hardcoded():
    """Missions must come from a real category gap, with evidence attached."""
    from httpx import ASGITransport, AsyncClient
    from backend.app.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        token = (await client.get("/api/v1/auth/demo-token")).json()["access_token"]
        res = await client.get("/api/v1/insights/growth-missions",
                               headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    missions = res.json()["missions"]
    assert missions, "expected at least one derived mission"

    m = missions[0]
    assert "cohort_insight" in m
    ev = m["evidence"]
    # The gap is what makes it a mission; it must be real and positive.
    assert ev["gap_pct"] > 0
    assert ev["cluster_share_pct"] > ev["your_share_pct"]
    # Cohort gate: a mission may never rest on fewer than 10 merchants.
    assert ev["cohort_size"] >= 10
    # Ranked by opportunity size.
    gaps = [x["evidence"]["gap_pct"] for x in missions]
    assert gaps == sorted(gaps, reverse=True)


def test_festivals_are_computed_from_the_calendar():
    """Days-remaining must track the real calendar, not a frozen literal."""
    from datetime import datetime, timezone
    from backend.app.analytics.festival import festival_engine

    fests = festival_engine.get_upcoming_festivals()
    assert fests, "calendar should always yield an upcoming festival"
    # Nearest first, non-negative, and within a year.
    days = [f["days_remaining"] for f in fests]
    assert days == sorted(days)
    assert all(0 <= d <= 366 for d in days)

    # Asking from a fixed date must move the answer - proof it is computed.
    pinned = festival_engine.get_upcoming_festivals(
        datetime(2026, 3, 1, tzinfo=timezone.utc)
    )
    assert (pinned[0]["festival_name"], pinned[0]["days_remaining"]) != (
        fests[0]["festival_name"], fests[0]["days_remaining"]
    )
