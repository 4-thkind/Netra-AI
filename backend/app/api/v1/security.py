from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from backend.app.core.database import get_db
from backend.app.models.audit import AuditEvent
from backend.app.models.merchants import Merchant
from backend.app.auth.dependencies import require_role

router = APIRouter()

@router.get("/audit-events")
async def get_audit_events(
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Admin/Auditor view of append-only audit stream"""
    stmt = select(AuditEvent).order_by(desc(AuditEvent.timestamp)).limit(limit)
    result = await db.execute(stmt)
    events = result.scalars().all()

    return {
        "count": len(events),
        "events": [
            {
                "id": e.id,
                "event_type": e.event_type,
                "merchant_id": e.merchant_id,
                "status": e.status,
                "details": e.details,
                "timestamp": e.timestamp.isoformat() if e.timestamp else None
            }
            for e in events
        ]
    }
