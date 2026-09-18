import time
import pytest
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
        {"time": time.time() - 5, "category": "snacks", "radius_km": 1.0}
    ]
    # Attempt micro-slice: radius 1.12 km
    safety = reconstruction_guard.check_query_safety(m_id, "snacks", 1.12)
    assert safety["safe"] is False
    assert "Suspected differencing reconstruction attack" in safety["reason"]
