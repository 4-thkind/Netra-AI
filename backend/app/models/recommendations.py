from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from backend.app.core.database import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, index=True)
    merchant_id = Column(String, ForeignKey("merchants.id"), index=True, nullable=False)
    recommendation_type = Column(String, index=True)  # trade_radar, price_pulse, cashflow, festival, growth_mission
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    what = Column(String, nullable=False)
    why = Column(String, nullable=False)
    so_what = Column(String, nullable=False)
    expected_action = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    evidence = Column(JSON, default=list)
    confidence = Column(Float, default=0.8)
    status = Column(String, default="pending")  # pending, accepted, rejected, completed
    safety_status = Column(String, default="approved")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))

class RecommendationOutcome(Base):
    __tablename__ = "recommendation_outcomes"

    id = Column(String, primary_key=True, index=True)
    recommendation_id = Column(String, ForeignKey("recommendations.id"), index=True)
    merchant_id = Column(String, ForeignKey("merchants.id"), index=True)
    action_taken = Column(String)  # accepted, rejected, dismissed
    outcome_metrics = Column(JSON, default=dict)
    feedback_notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
