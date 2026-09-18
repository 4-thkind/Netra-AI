from sqlalchemy import Column, String, Float, Integer, DateTime, JSON
from sqlalchemy.sql import func
from backend.app.core.database import Base

class MarketCluster(Base):
    __tablename__ = "market_clusters"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    radius_km = Column(Float, default=1.0)
    merchant_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MarketAggregate(Base):
    __tablename__ = "market_aggregates"

    id = Column(String, primary_key=True, index=True)
    cluster_id = Column(String, index=True, nullable=False)
    category_id = Column(String, index=True, nullable=False)
    time_window = Column(String, default="7d")
    merchant_count = Column(Integer, nullable=False)
    transaction_count = Column(Integer, nullable=False)
    median_atv = Column(Float, nullable=False)
    p25_atv = Column(Float, nullable=False)
    p75_atv = Column(Float, nullable=False)
    volume_velocity = Column(Float, default=0.0)  # e.g., +0.14 = +14%
    confidence = Column(Float, default=0.85)
    privacy_status = Column(String, default="APPROVED")  # APPROVED, SUPPRESSED
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
