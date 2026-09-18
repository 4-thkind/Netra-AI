from typing import Dict, Any, List

class CogneeMemoryAdapter:
    """
    Section 23: Cognee Knowledge Memory.
    Stores merchant-specific past decisions, feedback, and preferences.
    """
    def __init__(self):
        # In-memory graph nodes representation
        self.memory_store: Dict[str, List[Dict[str, Any]]] = {}

    def record_decision(self, merchant_id: str, action: str, category: str, result: str):
        if merchant_id not in self.memory_store:
            self.memory_store[merchant_id] = []
        self.memory_store[merchant_id].append({
            "action": action,
            "category": category,
            "result": result
        })

    def get_merchant_profile(self, merchant_id: str) -> Dict[str, Any]:
        history = self.memory_store.get(merchant_id, [
            {"action": "tested_combo_bundle", "category": "snacks", "result": "+18% sales"},
            {"action": "stocked_navratri_ghee", "category": "dairy", "result": "sold_out"}
        ])
        return {
            "merchant_id": merchant_id,
            "past_successful_actions": len(history),
            "preferred_strategy": "Value bundling over discounting",
            "memory_nodes": history
        }

cognee_adapter = CogneeMemoryAdapter()
