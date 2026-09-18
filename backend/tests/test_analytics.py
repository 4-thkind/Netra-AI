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

def test_growth_missions():
    missions = growth_mission_engine.get_active_missions("merchant_ramesh")
    assert len(missions) > 0
    assert "cohort_insight" in missions[0]
    assert "reward" in missions[0]
