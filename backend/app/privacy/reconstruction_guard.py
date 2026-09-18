from typing import Dict, Any, List
import time

class ReconstructionGuard:
    """
    Section 8: Anti-Reconstruction Sentinel.
    Detects repeated overlapping queries (e.g. slicing radius by 0.1km or rapid category swapping).
    """
    def __init__(self):
        self.recent_queries: Dict[str, List[Dict[str, Any]]] = {}

    def check_query_safety(
        self, 
        merchant_id: str, 
        category: str, 
        radius_km: float
    ) -> Dict[str, Any]:
        now = time.time()
        user_history = self.recent_queries.get(merchant_id, [])

        # Filter queries within last 60 seconds
        recent = [q for q in user_history if now - q["time"] < 60]
        self.recent_queries[merchant_id] = recent

        # Check for sliding radius manipulation (e.g., 1.0km, 1.1km, 1.2km)
        radius_variations = [abs(q["radius_km"] - radius_km) for q in recent if q["category"] == category]
        for diff in radius_variations:
            if 0.0 < diff < 0.3:  # Micro-slice detected
                return {
                    "safe": False,
                    "reason": "Suspected differencing reconstruction attack: micro-radius variance rejected."
                }

        # Check burst frequency
        if len(recent) >= 6:
            return {
                "safe": False,
                "reason": "Rapid query burst detected. Anti-reconstruction rate limit applied."
            }

        # Log current query
        recent.append({"time": now, "category": category, "radius_km": radius_km})
        self.recent_queries[merchant_id] = recent
        return {"safe": True, "reason": "Query verified privacy-safe."}

reconstruction_guard = ReconstructionGuard()
