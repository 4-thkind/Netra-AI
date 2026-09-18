import os

files = {}

files["backend/app/schemas/__init__.py"] = ""

files["backend/app/schemas/auth.py"] = '''from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    merchant_id: str
    name: str
    role: str

class TokenData(BaseModel):
    merchant_id: Optional[str] = None
    role: Optional[str] = "MERCHANT"

class LoginRequest(BaseModel):
    phone: str
    password: str

class MerchantResponse(BaseModel):
    id: str
    name: str
    phone: str
    role: str
    category: str
    city: str
    cluster_id: str
'''

files["backend/app/schemas/insights.py"] = '''from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class InsightCard(BaseModel):
    id: str
    type: str  # trade_radar, price_pulse, cashflow, festival, growth_mission
    title: str
    headline: str
    what: str
    why: str
    so_what: str
    expected_action: str
    confidence: float
    status: str
    evidence: List[str] = []
    metadata: Dict[str, Any] = {}

class CashflowForecastDay(BaseModel):
    date: str
    day_name: str
    projected_inflow: float
    confidence_low: float
    confidence_high: float
    risk_level: str  # normal, low, warning

class CashflowResponse(BaseModel):
    period: str
    total_projected_7d: float
    risk_summary: str
    recommended_action: str
    days: List[CashflowForecastDay]

class PricePulseResponse(BaseModel):
    category: str
    merchant_median_atv: float
    category_benchmark_median: float
    category_benchmark_p25: float
    category_benchmark_p75: float
    message: str
    recommended_action: str
    competition_safety_note: str

class TradeRadarSignal(BaseModel):
    category: str
    market_velocity: float
    merchant_activity_level: str
    opportunity_score: float
    recommendation: str

class FestivalAlert(BaseModel):
    festival_name: str
    date: str
    days_remaining: int
    impact_level: str
    recommended_stock: List[str]
    suggested_offer: str
'''

files["backend/app/schemas/recommendations.py"] = '''from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class RecommendationActionRequest(BaseModel):
    action: str  # accept, reject, dismiss
    notes: Optional[str] = None

class RecommendationResponse(BaseModel):
    id: str
    recommendation_type: str
    title: str
    message: str
    what: str
    why: str
    so_what: str
    expected_action: str
    confidence: float
    status: str
    created_at: str
'''

files["backend/app/schemas/privacy.py"] = '''from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class PrivacyPolicyResponse(BaseModel):
    min_market_merchants: int
    min_category_merchants: int
    max_queries_per_window: int
    geographic_expansion_enabled: bool
    noise_enabled: bool
    status: str

class PrivacyQueryCheck(BaseModel):
    allowed: bool
    reason: str
    cohort_size: Optional[int] = None
    expanded_radius_km: Optional[float] = None
    suppressed: bool = False

class AttackSimulationRequest(BaseModel):
    attack_type: str  # small_cohort, competitor_price, reconstruction_diff, prompt_injection
    category: Optional[str] = "beverages"
    radius_km: Optional[float] = 1.0
    target_competitor: Optional[str] = "Gupta General Store"
    prompt: Optional[str] = None

class AttackSimulationResponse(BaseModel):
    attack_type: str
    blocked: bool
    security_event: str
    system_response: str
    explanation: str
'''

files["backend/app/auth/__init__.py"] = ""

files["backend/app/auth/security.py"] = '''import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from backend.app.core.config import settings

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except Exception:
        return None
'''

files["backend/app/auth/dependencies.py"] = '''from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.models.merchants import Merchant
from backend.app.auth.security import decode_access_token

security_bearer = HTTPBearer(auto_error=False)

async def get_current_merchant(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_db)
) -> Merchant:
    if not credentials:
        # For Hackathon convenience, if no bearer token is present, fall back to Ramesh demo merchant
        stmt = select(Merchant).where(Merchant.id == "merchant_ramesh")
        result = await db.execute(stmt)
        demo_merchant = result.scalar_one_or_none()
        if demo_merchant:
            return demo_merchant
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided."
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token."
        )

    merchant_id = payload["sub"]
    stmt = select(Merchant).where(Merchant.id == merchant_id)
    result = await db.execute(stmt)
    merchant = result.scalar_one_or_none()
    if not merchant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant identity not found."
        )
    return merchant

def require_role(allowed_roles: list):
    async def role_checker(current_user: Merchant = Depends(get_current_merchant)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role {current_user.role}."
            )
        return current_user
    return role_checker
'''

files["backend/app/security/__init__.py"] = ""

files["backend/app/security/audit.py"] = '''from datetime import datetime, timezone
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.audit import AuditEvent

class AuditLogger:
    @staticmethod
    async def log_event(
        db: AsyncSession,
        event_type: str,
        merchant_id: str = None,
        ip_address: str = "127.0.0.1",
        status: str = "SUCCESS",
        details: dict = None
    ):
        event = AuditEvent(
            id=f"audit_{uuid.uuid4().hex[:12]}",
            event_type=event_type,
            merchant_id=merchant_id,
            ip_address=ip_address,
            status=status,
            details=details or {}
        )
        db.add(event)
        try:
            await db.commit()
        except Exception:
            await db.rollback()

audit_logger = AuditLogger()
'''

files["backend/app/privacy/__init__.py"] = ""

files["backend/app/privacy/policies.py"] = '''from dataclasses import dataclass
from backend.app.core.config import settings

@dataclass(frozen=True)
class PrivacyPolicy:
    min_market_merchants: int = settings.MIN_MARKET_MERCHANTS
    min_category_merchants: int = settings.MIN_CATEGORY_MERCHANTS
    max_sensitive_queries_per_window: int = settings.MAX_SENSITIVE_QUERIES_PER_WINDOW
    query_window_hours: int = settings.QUERY_WINDOW_HOURS
    geographic_expansion_enabled: bool = True
    noise_enabled: bool = True
    rounding_enabled: bool = True
    noise_epsilon: float = settings.PRIVACY_NOISE_EPSILON

privacy_policy = PrivacyPolicy()
'''

files["backend/app/privacy/geographic_privacy.py"] = '''from typing import Tuple, List, Dict
import math

class GeographicPrivacyService:
    # Micro-market cluster centroid definitions (no exact store GPS exposed)
    CLUSTERS: Dict[str, Dict[str, float]] = {
        "delhi_lajpat_nagar": {"lat": 28.5677, "lon": 77.2433, "merchants": 42},
        "delhi_karol_bagh": {"lat": 28.6517, "lon": 77.1906, "merchants": 38},
        "delhi_chandni_chowk": {"lat": 28.6506, "lon": 77.2303, "merchants": 55},
        "delhi_indirapuram": {"lat": 28.6385, "lon": 77.3686, "merchants": 29},
        "delhi_rohini": {"lat": 28.7166, "lon": 77.1126, "merchants": 34},
        # Isolated small cohort cluster for hackathon demonstration
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
        """
        Expands from 1km -> 3km -> 5km if local cohort is too small.
        Returns: (effective_cluster_label, radius_km, merchant_count)
        """
        cluster = GeographicPrivacyService.get_cluster_info(cluster_id)
        local_count = cluster["merchants"]

        if local_count >= min_required:
            return cluster_id, 1.0, local_count
        
        # 3km expansion simulation
        expanded_count_3km = local_count + 4
        if expanded_count_3km >= min_required:
            return f"{cluster_id}_expanded_3km", 3.0, expanded_count_3km
        
        # 5km expansion simulation
        expanded_count_5km = expanded_count_3km + 3
        if expanded_count_5km >= min_required:
            return f"{cluster_id}_expanded_5km", 5.0, expanded_count_5km

        # Still insufficient
        return cluster_id, 5.0, expanded_count_5km

geo_privacy_service = GeographicPrivacyService()
'''

files["backend/app/privacy/suppression.py"] = '''from backend.app.privacy.policies import privacy_policy
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
'''

files["backend/app/privacy/query_budget.py"] = '''from datetime import datetime, timezone, timedelta
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
'''

files["backend/app/privacy/reconstruction_guard.py"] = '''from typing import Dict, Any, List
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
'''

files["backend/app/privacy/aggregation.py"] = '''import numpy as np
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
'''

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"Wrote {path}")
