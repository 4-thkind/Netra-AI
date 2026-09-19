from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.models.merchants import Merchant
from backend.app.schemas.auth import LoginRequest, Token
from backend.app.auth.security import verify_password, create_access_token
from backend.app.security.audit import audit_logger

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(Merchant).where(Merchant.phone == req.phone)
    result = await db.execute(stmt)
    merchant = result.scalar_one_or_none()

    if not merchant or not verify_password(req.password, merchant.hashed_password):
        await audit_logger.log_event(
            db, 
            event_type="AUTH_FAILURE", 
            merchant_id=merchant.id if merchant else None,
            status="BLOCKED",
            details={"phone": req.phone, "reason": "Invalid credentials"}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password."
        )

    token = create_access_token(data={"sub": merchant.id, "role": merchant.role})
    await audit_logger.log_event(
        db,
        event_type="AUTH_LOGIN",
        merchant_id=merchant.id,
        status="SUCCESS",
        details={"role": merchant.role}
    )
    return Token(
        access_token=token,
        merchant_id=merchant.id,
        name=merchant.name,
        role=merchant.role
    )

@router.get("/demo-token")
async def get_demo_token(db: AsyncSession = Depends(get_db)):
    """Convenience endpoint for hackathon evaluation: returns demo token for Sanjeev"""
    stmt = select(Merchant).where(Merchant.id == "merchant_ramesh")
    result = await db.execute(stmt)
    ramesh = result.scalar_one_or_none()
    if not ramesh:
        raise HTTPException(status_code=404, detail="Demo merchant not found.")

    token = create_access_token(data={"sub": ramesh.id, "role": ramesh.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "merchant": {
            "id": ramesh.id,
            "name": ramesh.name,
            "role": ramesh.role,
            "city": ramesh.city,
            "cluster": ramesh.cluster_id
        }
    }
