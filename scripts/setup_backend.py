import os

files = {}

files["backend/app/__init__.py"] = ""

files["backend/app/core/__init__.py"] = ""
files["backend/app/core/config.py"] = '''from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "Netra"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    DEMO_MODE: bool = True

    # Security
    SECRET_KEY: str = "netra-hackathon-super-secret-key-2026-secure-random-bytes"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Privacy Invariants
    MIN_MARKET_MERCHANTS: int = 10
    MIN_CATEGORY_MERCHANTS: int = 8
    MAX_SENSITIVE_QUERIES_PER_WINDOW: int = 15
    QUERY_WINDOW_HOURS: int = 24
    PRIVACY_NOISE_EPSILON: float = 0.05

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./netra.db"

    # Redis (optional fallback to in-memory)
    REDIS_URL: Optional[str] = None

    # Integrations
    SARVAM_API_KEY: str = "mock-sarvam-key"
    SARVAM_BASE_URL: str = "https://api.sarvam.ai"
    COGNEE_API_KEY: str = "mock-cognee-key"
    N8N_WEBHOOK_URL: str = "http://localhost:5678/webhook/netra"
    PAYTM_MERCHANT_KEY: str = "mock-paytm-key"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
'''

files["backend/app/core/database.py"] = '''from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from backend.app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
'''

files["backend/app/models/__init__.py"] = ""

files["backend/app/models/merchants.py"] = '''from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.sql import func
from backend.app.core.database import Base

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String, primary_key=True, index=True)
    external_id_hash = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    role = Column(String, default="MERCHANT")  # MERCHANT, ADMIN, PRIVACY_AUDITOR
    category = Column(String, default="kirana", index=True)
    city = Column(String, default="Delhi", index=True)
    cluster_id = Column(String, index=True)  # e.g., "delhi_lajpat_nagar"
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class MerchantPreference(Base):
    __tablename__ = "merchant_preferences"

    merchant_id = Column(String, ForeignKey("merchants.id"), primary_key=True)
    language = Column(String, default="hi")  # hi, en, ta, te
    preferred_channel = Column(String, default="soundbox")  # soundbox, app, whatsapp
    risk_tolerance = Column(String, default="moderate")
    notification_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
'''

files["backend/app/models/transactions.py"] = '''from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from backend.app.core.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    merchant_id = Column(String, ForeignKey("merchants.id"), index=True, nullable=False)
    category_id = Column(String, index=True, nullable=False)  # beverages, snacks, staples, dairy, etc.
    amount = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    location_bucket = Column(String, index=True, nullable=False)

    __table_args__ = (
        Index("ix_tx_merchant_ts", "merchant_id", "timestamp"),
        Index("ix_tx_bucket_cat", "location_bucket", "category_id"),
    )
'''

files["backend/app/models/analytics.py"] = '''from sqlalchemy import Column, String, Float, Integer, DateTime, JSON
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
'''

files["backend/app/models/recommendations.py"] = '''from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
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
'''

files["backend/app/models/audit.py"] = '''from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from backend.app.core.database import Base

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True, index=True)
    event_type = Column(String, index=True, nullable=False)
    merchant_id = Column(String, index=True, nullable=True)
    ip_address = Column(String, nullable=True)
    status = Column(String, nullable=False)  # SUCCESS, BLOCKED, SUPPRESSED, WARNING
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
'''

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"Wrote {path}")
