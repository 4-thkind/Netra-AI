from pydantic import BaseModel
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
