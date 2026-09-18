from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from backend.app.core.config import settings
from backend.app.core.database import Base, engine
from backend.app.api.v1 import api_v1_router
from backend.app.data.synthetic_generator import seed_synthetic_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Auto-seed synthetic data in demo mode
    if settings.DEMO_MODE:
        await seed_synthetic_data()
    
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Netrā: AI Growth Copilot for Indian Kirana Merchants",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Structured Error Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": "An internal service error occurred."}}
    )

app.include_router(api_v1_router)

@app.get("/")
async def root():
    return {
        "product": "Netrā",
        "tagline": "Network intelligence without merchant exposure",
        "version": "1.0.0",
        "docs": "/docs",
        "demo_mode": settings.DEMO_MODE
    }

@app.get("/health")
async def root_health():
    return {"status": "ok", "service": "Netra API"}
