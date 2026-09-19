from pydantic_settings import BaseSettings
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

    # External AI & Orchestration Integrations
    SARVAM_API_KEY: str = "mock-sarvam-key"
    SARVAM_BASE_URL: str = "https://api.sarvam.ai"
    COGNEE_API_KEY: str = "mock-cognee-key"
    N8N_WEBHOOK_URL: str = "http://localhost:5678/webhook/netra"
    PAYTM_MERCHANT_KEY: str = "mock-paytm-key"

    # LLM Providers (OpenRouter free tier or NVIDIA NIM)
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

    # Model order is set by MEASURED reliability on the free tier, not by model
    # size. Benchmarked 3 identical Hindi-JSON calls per model:
    #
    #   nemotron-3-super-120b   3/3 JSON, 3/3 Hindi, ~4.4s median
    #   deepseek-v4-flash       3/3 JSON, 3/3 Hindi, ~4.3s median
    #   qwen3.8-27b             1/3 answered (2x HTTP 429), 0/3 Hindi, up to 27s
    #   gemma-4-31b             2/6 availability probes
    #
    # Qwen is the better model on paper and stays in the chain, but its shared
    # free pool rate-limits too hard to lead with during a live demo.
    OPENROUTER_MODEL: str = "nvidia/nemotron-3-super-120b-a12b:free"

    OPENROUTER_FALLBACK_MODELS: str = (
        "deepseek/deepseek-v4-flash-0731:free,"
        "qwen/qwen3.8-27b:free,"
        "google/gemma-4-31b-it:free"
    )

    NVIDIA_API_KEY: Optional[str] = None
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NVIDIA_MODEL: str = "meta/llama-3.3-70b-instruct"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
