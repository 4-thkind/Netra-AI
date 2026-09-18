from fastapi import APIRouter
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.merchant import router as merchant_router
from backend.app.api.v1.insights import router as insights_router
from backend.app.api.v1.recommendations import router as recommendations_router
from backend.app.api.v1.privacy import router as privacy_router
from backend.app.api.v1.security import router as security_router
from backend.app.api.v1.simulator import router as simulator_router
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.n8n_integration import router as n8n_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_v1_router.include_router(merchant_router, prefix="/merchant", tags=["Merchant"])
api_v1_router.include_router(insights_router, prefix="/insights", tags=["Insights"])
api_v1_router.include_router(recommendations_router, prefix="/recommendations", tags=["Recommendations"])
api_v1_router.include_router(privacy_router, prefix="/privacy", tags=["Privacy"])
api_v1_router.include_router(security_router, prefix="/security", tags=["Security Sentinel"])
api_v1_router.include_router(simulator_router, prefix="/simulator", tags=["Attack Simulator"])
api_v1_router.include_router(n8n_router, prefix="/n8n", tags=["n8n Orchestration"])
api_v1_router.include_router(health_router, tags=["Health"])
