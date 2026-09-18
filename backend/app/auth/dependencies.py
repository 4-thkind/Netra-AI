from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.models.merchants import Merchant
from backend.app.auth.security import decode_access_token

security_bearer = HTTPBearer(auto_error=False)

async def get_current_merchant(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_db)
) -> Merchant:
    if not credentials:
        # For Hackathon convenience, if no bearer token is present, fall back to Ramesh demo merchant
        stmt = select(Merchant).where(Merchant.id == "merchant_ramesh")
        result = await db.execute(stmt)
        demo_merchant = result.scalar_one_or_none()
        if demo_merchant:
            return demo_merchant
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided."
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token."
        )

    merchant_id = payload["sub"]
    stmt = select(Merchant).where(Merchant.id == merchant_id)
    result = await db.execute(stmt)
    merchant = result.scalar_one_or_none()
    if not merchant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Merchant identity not found."
        )
    return merchant

def require_role(allowed_roles: list):
    async def role_checker(current_user: Merchant = Depends(get_current_merchant)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted for role {current_user.role}."
            )
        return current_user
    return role_checker
