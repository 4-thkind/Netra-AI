from datetime import datetime, timezone, timedelta
from typing import Dict, List
from collections import defaultdict
from backend.app.privacy.policies import privacy_policy

class QueryBudgetService:
    """
    Sliding window query budget tracker preventing query exhaustion / differencing attacks.
    """
    def __init__(self):
        # In-memory sliding query timestamps per merchant: {merchant_id: [datetime, ...]}
        self.merchant_queries: Dict[str, List[datetime]] = defaultdict(list)

    def record_and_check_budget(self, merchant_id: str) -> bool:
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(hours=privacy_policy.query_window_hours)

        # Evict timestamps older than query window
        valid_queries = [ts for ts in self.merchant_queries[merchant_id] if ts > cutoff]
        self.merchant_queries[merchant_id] = valid_queries

        if len(valid_queries) >= privacy_policy.max_sensitive_queries_per_window:
            return False  # Budget exhausted

        self.merchant_queries[merchant_id].append(now)
        return True

    def get_remaining_budget(self, merchant_id: str) -> int:
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(hours=privacy_policy.query_window_hours)
        valid = [ts for ts in self.merchant_queries[merchant_id] if ts > cutoff]
        return max(0, privacy_policy.max_sensitive_queries_per_window - len(valid))

query_budget_service = QueryBudgetService()
