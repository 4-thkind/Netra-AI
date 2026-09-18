import re

# 1. Update geographic_privacy.py
with open("backend/app/privacy/geographic_privacy.py", "r") as f:
    geo_code = f.read()

new_geo_code = '''from typing import Tuple, List, Dict

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
'''

with open("backend/app/privacy/geographic_privacy.py", "w") as f:
    f.write(new_geo_code)

# 2. Update test_privacy.py
with open("backend/tests/test_privacy.py", "r") as f:
    test_code = f.read()

test_code = test_code.replace(
    '{"time": 1000.0, "category": "snacks", "radius_km": 1.0}',
    '{"time": time.time() - 5, "category": "snacks", "radius_km": 1.0}'
)
if "import time" not in test_code:
    test_code = "import time\n" + test_code

with open("backend/tests/test_privacy.py", "w") as f:
    f.write(test_code)

# 3. Update synthetic_generator.py to pre-hash password
with open("backend/app/data/synthetic_generator.py", "r") as f:
    gen_code = f.read()

old_loop = 'hashed_password=hash_password("kirana123")'
new_loop = 'hashed_password=common_pwd_hash'
if 'common_pwd_hash = hash_password("kirana123")' not in gen_code:
    gen_code = gen_code.replace(
        'store_names = [',
        'common_pwd_hash = hash_password("kirana123")\n        store_names = ['
    )
    gen_code = gen_code.replace(old_loop, new_loop)

with open("backend/app/data/synthetic_generator.py", "w") as f:
    f.write(gen_code)

print("Updated geographic_privacy, test_privacy, and synthetic_generator.")
