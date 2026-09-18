from datetime import datetime, timezone
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
