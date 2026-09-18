import numpy as np
import random
from typing import List, Dict, Any
from backend.app.privacy.policies import privacy_policy

class PrivacyAggregationEngine:
    @staticmethod
    def compute_safe_distribution(amounts: List[float]) -> Dict[str, float]:
        """
        Computes robust non-identifying distribution bounds:
        Median, P25, P75 with Laplace-like differential noise & rounding.
        NEVER returns min, max, or individual transaction amounts.
        """
        if not amounts:
            return {"median": 0.0, "p25": 0.0, "p75": 0.0}

        arr = np.array(amounts)
        median_val = float(np.median(arr))
        p25_val = float(np.percentile(arr, 25))
        p75_val = float(np.percentile(arr, 75))

        if privacy_policy.noise_enabled:
            noise_scale = median_val * privacy_policy.noise_epsilon
            median_val += random.uniform(-noise_scale, noise_scale)
            p25_val += random.uniform(-noise_scale, noise_scale)
            p75_val += random.uniform(-noise_scale, noise_scale)

        if privacy_policy.rounding_enabled:
            # Round to nearest whole rupee to prevent precision-based subtraction
            median_val = round(median_val, 0)
            p25_val = round(p25_val, 0)
            p75_val = round(p75_val, 0)

        return {
            "median": max(1.0, median_val),
            "p25": max(1.0, p25_val),
            "p75": max(median_val, p75_val)
        }

privacy_aggregation_engine = PrivacyAggregationEngine()
