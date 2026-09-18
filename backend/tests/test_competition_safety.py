import pytest
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
