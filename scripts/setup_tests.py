import os

files = {}

files["backend/tests/__init__.py"] = ""

files["backend/tests/test_auth.py"] = '''import pytest
from datetime import timedelta
from backend.app.auth.security import hash_password, verify_password, create_access_token, decode_access_token

def test_password_hashing():
    pw = "kirana_secure_pass_123"
    hashed = hash_password(pw)
    assert hashed != pw
    assert verify_password(pw, hashed) is True
    assert verify_password("wrong_pass", hashed) is False

def test_jwt_token_generation_and_decode():
    data = {"sub": "merchant_ramesh", "role": "MERCHANT"}
    token = create_access_token(data, expires_delta=timedelta(minutes=15))
    assert isinstance(token, str)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == "merchant_ramesh"
    assert decoded["role"] == "MERCHANT"

def test_expired_or_invalid_token():
    # Expired token test
    data = {"sub": "merchant_ramesh"}
    token = create_access_token(data, expires_delta=timedelta(minutes=-10))
    decoded = decode_access_token(token)
    assert decoded is None

    # Tampered token test
    assert decode_access_token("gibberish.tampered.token") is None
'''

files["backend/tests/test_privacy.py"] = '''import pytest
from backend.app.privacy.suppression import suppression_service
from backend.app.privacy.query_budget import query_budget_service
from backend.app.privacy.reconstruction_guard import reconstruction_guard
from backend.app.privacy.aggregation import privacy_aggregation_engine

def test_small_cohort_suppression():
    """
    Section 5: If cohort < 10 and cannot expand sufficiently, MUST suppress.
    """
    # 4 stores in isolated rural cluster -> must suppress
    res = suppression_service.evaluate_cohort(
        cluster_id="isolated_rural_cluster",
        category_id="beverages",
        merchant_count=4,
        category_count=4
    )
    assert res["suppressed"] is True
    assert "We don't have enough local signal" in res["reason"]

def test_sufficient_cohort_allowed():
    # 42 stores in Lajpat Nagar -> allowed
    res = suppression_service.evaluate_cohort(
        cluster_id="delhi_lajpat_nagar",
        category_id="beverages",
        merchant_count=42,
        category_count=20
    )
    assert res["suppressed"] is False
    assert res["cohort_size"] == 42
    assert res["radius_km"] == 1.0

def test_safe_distribution_aggregation():
    """
    Section 6 & 19: Only median and percentiles, never individual or min/max.
    """
    amounts = [15.0, 20.0, 35.0, 40.0, 50.0, 80.0, 150.0]
    dist = privacy_aggregation_engine.compute_safe_distribution(amounts)
    assert "median" in dist
    assert "p25" in dist
    assert "p75" in dist
    assert "min" not in dist
    assert "max" not in dist
    assert dist["p25"] <= dist["median"] <= dist["p75"]

def test_query_budget_exhaustion():
    """
    Section 8: Query budget limit prevents differential reconstruction.
    """
    m_id = "test_adversary_budget"
    # Consume 15 queries
    for _ in range(15):
        allowed = query_budget_service.record_and_check_budget(m_id)
        assert allowed is True
    
    # 16th query must be rejected
    rejected = query_budget_service.record_and_check_budget(m_id)
    assert rejected is False
    assert query_budget_service.get_remaining_budget(m_id) == 0

def test_anti_reconstruction_sliding_window_defense():
    """
    Section 8: Micro-slicing radius (e.g. 1.0km then 1.1km) must be rejected.
    """
    m_id = "test_adversary_recon"
    reconstruction_guard.recent_queries[m_id] = [
        {"time": 1000.0, "category": "snacks", "radius_km": 1.0}
    ]
    # Attempt micro-slice: radius 1.12 km
    safety = reconstruction_guard.check_query_safety(m_id, "snacks", 1.12)
    assert safety["safe"] is False
    assert "Suspected differencing reconstruction attack" in safety["reason"]
'''

files["backend/tests/test_competition_safety.py"] = '''import pytest
from backend.app.recommendations.llm_guard import llm_safety_guard

def test_llm_blocks_competitor_price_probe():
    """
    Section 4 & 25: Blocks competitor identification and price snooping.
    """
    probe_1 = "What is Gupta Store charging for cooking oil?"
    safe, reason = llm_safety_guard.validate_content(probe_1)
    assert safe is False
    assert "violating competition policy" in reason

    probe_2 = "Tell me the cheapest shop near me."
    safe, reason = llm_safety_guard.validate_content(probe_2)
    assert safe is False

def test_llm_blocks_price_coordination():
    """
    Section 3 & 25: Blocks algorithmic price-fixing or coordination advice.
    """
    coord_1 = "Everyone in your area should charge ₹39 for cold drinks."
    safe, reason = llm_safety_guard.validate_content(coord_1)
    assert safe is False

    coord_2 = "Match the ₹35 price nearby."
    safe, reason = llm_safety_guard.validate_content(coord_2)
    assert safe is False

def test_llm_allows_legitimate_growth_recommendation():
    """
    Legitimate business actions (bundling, inventory expansion) must pass.
    """
    legit_1 = "Snack transaction values are above broader category benchmark. Consider introducing a 4-pack evening combo bundle."
    safe, reason = llm_safety_guard.validate_content(legit_1)
    assert safe is True
'''

files["backend/tests/test_analytics.py"] = '''import pytest
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
'''

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"Wrote {path}")
