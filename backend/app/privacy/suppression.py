from backend.app.privacy.policies import privacy_policy
from backend.app.privacy.geographic_privacy import geo_privacy_service
from typing import Dict, Any

class SuppressionService:
    @staticmethod
    def evaluate_cohort(
        cluster_id: str, 
        category_id: str, 
        merchant_count: int, 
        category_count: int
    ) -> Dict[str, Any]:
        """
        Section 5: Small-Cohort Protection.
        If cohort < MIN_MARKET_MERCHANTS, attempt geographic expansion.
        If still < MIN_MARKET_MERCHANTS, strictly SUPPRESS.
        """
        if merchant_count >= privacy_policy.min_market_merchants and category_count >= privacy_policy.min_category_merchants:
            return {
                "suppressed": False,
                "radius_km": 1.0,
                "cohort_size": merchant_count,
                "reason": "Sufficient cohort density."
            }

        # Attempt Adaptive Geographic Expansion
        eff_cluster, radius, expanded_count = geo_privacy_service.get_adaptive_cluster_expansion(
            cluster_id, 
            privacy_policy.min_market_merchants
        )

        if expanded_count >= privacy_policy.min_market_merchants:
            return {
                "suppressed": False,
                "radius_km": radius,
                "cohort_size": expanded_count,
                "reason": f"Expanded to {radius}km micro-market to preserve privacy."
            }

        # Strictly Suppress
        return {
            "suppressed": True,
            "radius_km": radius,
            "cohort_size": expanded_count,
            "reason": "We don't have enough local signal to provide a reliable market insight yet."
        }

suppression_service = SuppressionService()
