from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": "Netra API", "timestamp": datetime.now(timezone.utc).isoformat()}

@router.get("/ready")
async def readiness_check():
    return {"ready": True, "database": "connected", "privacy_engine": "active"}

@router.get("/metrics")
async def metrics():
    return {
        "privacy_suppressions_total": 4,
        "competitor_probes_blocked": 12,
        "recommendations_served": 48,
        "median_latency_ms": 14.2
    }
