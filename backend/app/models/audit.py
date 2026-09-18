from sqlalchemy import Column, String, DateTime, JSON
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
