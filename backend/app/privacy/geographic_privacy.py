from typing import Tuple, List, Dict

class GeographicPrivacyService:
    CLUSTERS: Dict[str, Dict[str, float]] = {
        "delhi_lajpat_nagar": {"lat": 28.5677, "lon": 77.2433, "merchants": 42},
        "delhi_karol_bagh": {"lat": 28.6517, "lon": 77.1906, "merchants": 38},
        "delhi_chandni_chowk": {"lat": 28.6506, "lon": 77.2303, "merchants": 55},
        "delhi_indirapuram": {"lat": 28.6385, "lon": 77.3686, "merchants": 29},
        "delhi_rohini": {"lat": 28.7166, "lon": 77.1126, "merchants": 34},
        # Isolated small cohort cluster for hackathon demonstration (stays under 10 even at 5km)
        "isolated_rural_cluster": {"lat": 28.4089, "lon": 77.3178, "merchants": 4}
    }

    @staticmethod
    def get_cluster_info(cluster_id: str) -> Dict:
        return GeographicPrivacyService.CLUSTERS.get(
            cluster_id, 
            {"lat": 28.5677, "lon": 77.2433, "merchants": 25}
        )

    @staticmethod
    def get_adaptive_cluster_expansion(cluster_id: str, min_required: int = 10) -> Tuple[str, float, int]:
        cluster = GeographicPrivacyService.get_cluster_info(cluster_id)
        local_count = cluster["merchants"]

        if local_count >= min_required:
            return cluster_id, 1.0, local_count

        if cluster_id == "isolated_rural_cluster":
            # True isolated cluster: 3km = 5 stores, 5km = 6 stores (still < 10 -> MUST SUPPRESS)
            return cluster_id, 5.0, 6

        # Standard clusters with neighboring density
        expanded_count_3km = local_count + 6
        if expanded_count_3km >= min_required:
            return f"{cluster_id}_expanded_3km", 3.0, expanded_count_3km

        expanded_count_5km = expanded_count_3km + 6
        if expanded_count_5km >= min_required:
            return f"{cluster_id}_expanded_5km", 5.0, expanded_count_5km

        return cluster_id, 5.0, local_count

geo_privacy_service = GeographicPrivacyService()
