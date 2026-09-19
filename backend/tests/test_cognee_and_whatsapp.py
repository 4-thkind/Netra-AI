"""Cognee knowledge graph + n8n WhatsApp delivery (PPT slides 6 and 7)."""

import pytest

from backend.app.integrations.cognee_adapter import CogneeMemoryAdapter
from backend.app.integrations.whatsapp_delivery import WhatsAppDeliveryService


# --- Cognee knowledge graph ------------------------------------------------

def _graph_with_peers(peers=3):
    a = CogneeMemoryAdapter()
    a.register_merchant("m1", "Ramesh", "delhi_lajpat_nagar", "kirana", "hi")
    for i in range(peers):
        a.register_merchant(f"p{i}", f"Peer {i}", "delhi_lajpat_nagar", "kirana", "hi")
    return a


def test_graph_builds_typed_nodes_and_cohorts():
    a = _graph_with_peers()
    stats = a.graph.stats()
    assert stats["node_types"]["Merchant"] == 4
    assert stats["node_types"]["Cohort"] == 1      # same cluster+category
    assert a.get_merchant_profile("m1")["cohort_peers"] == 3


def test_reinforcement_loop_changes_recommendations():
    """Slide 7: action outcome -> update graph -> retrain cohort recommendations."""
    a = _graph_with_peers()
    for i in range(3):
        a.record_decision(f"p{i}", "combo_bundle", "beverages", "accepted")

    recs = a.cohort_recommendations("m1")
    assert recs[0]["category"] == "beverages"
    assert recs[0]["peer_adoptions"] == 3

    # Once this merchant acts, the suggestion is no longer surfaced to them.
    a.record_decision("m1", "combo_bundle", "beverages", "accepted")
    assert all(r["category"] != "beverages" for r in a.cohort_recommendations("m1"))


def test_dismissed_actions_do_not_propagate():
    a = _graph_with_peers()
    for i in range(3):
        a.record_decision(f"p{i}", "discount_push", "snacks", "dismiss")
    # Only accepted outcomes should influence peers.
    assert a.cohort_recommendations("m1") == []


def test_profile_infers_strategy_from_history():
    a = _graph_with_peers()
    p = a.get_merchant_profile("m1")
    assert p["past_successful_actions"] == 0

    a.record_decision("m1", "combo_bundle", "dairy", "accepted")
    p = a.get_merchant_profile("m1")
    assert p["past_successful_actions"] == 1
    assert p["acceptance_rate"] == 1.0
    assert "dairy" in p["preferred_strategy"]


def test_unknown_merchant_is_handled():
    a = CogneeMemoryAdapter()
    p = a.get_merchant_profile("nobody")
    assert p["known"] is False
    assert a.cohort_recommendations("nobody") == []


def test_export_graph_shape_for_visualiser():
    a = _graph_with_peers()
    a.record_decision("m1", "combo_bundle", "beverages", "accepted")
    g = a.export_graph("m1", radius=2)
    assert g["nodes"] and g["edges"]
    ids = {n["id"] for n in g["nodes"]}
    # Every edge must reference nodes present in the export, or the SVG breaks.
    for e in g["edges"]:
        assert e["source"] in ids and e["target"] in ids


# --- WhatsApp number handling ---------------------------------------------

@pytest.mark.parametrize("raw,expected", [
    ("9876543210", "+919876543210"),
    ("098765 43210", "+919876543210"),      # trunk prefix
    ("+91 98765-43210", "+919876543210"),   # already international
    ("+1 415 555 0132", "+14155550132"),    # non-Indian preserved
])
def test_number_normalisation(raw, expected):
    assert WhatsAppDeliveryService.normalise_number(raw) == expected


@pytest.mark.parametrize("raw", ["", "abc", None])
def test_unusable_numbers_return_empty(raw):
    assert WhatsAppDeliveryService.normalise_number(raw) == ""


@pytest.mark.asyncio
async def test_send_simulates_without_any_provider(monkeypatch):
    """With no n8n webhook AND no Cloud API credentials, delivery is simulated."""
    from backend.app.core import config as cfg
    monkeypatch.setattr(cfg.settings, "WHATSAPP_PHONE_ID", None, raising=False)
    monkeypatch.setattr(cfg.settings, "WHATSAPP_TOKEN", None, raising=False)

    svc = WhatsAppDeliveryService()
    res = await svc.send(to_number="9876543210", merchant_name="Ramesh",
                         message="Beverages up 18%")
    # The envelope is still real and inspectable; only the last mile is absent.
    assert res["status"] == "SIMULATED"
    assert res["to"] == "+919876543210"
    assert res["body"] == "Beverages up 18%"


@pytest.mark.asyncio
async def test_send_rejects_unusable_number():
    svc = WhatsAppDeliveryService()
    res = await svc.send(to_number="not-a-number", merchant_name="X", message="hi")
    assert res["status"] == "FAILED"
    assert res["delivery"] == "invalid_number"
