from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, JSON
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
