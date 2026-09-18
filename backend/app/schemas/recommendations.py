from pydantic import BaseModel
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
