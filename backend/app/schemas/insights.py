from pydantic import BaseModel
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
