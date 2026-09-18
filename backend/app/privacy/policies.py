from dataclasses import dataclass
from backend.app.core.config import settings

@dataclass(frozen=True)
class PrivacyPolicy:
    min_market_merchants: int = settings.MIN_MARKET_MERCHANTS
    min_category_merchants: int = settings.MIN_CATEGORY_MERCHANTS
    max_sensitive_queries_per_window: int = settings.MAX_SENSITIVE_QUERIES_PER_WINDOW
    query_window_hours: int = settings.QUERY_WINDOW_HOURS
    geographic_expansion_enabled: bool = True
    noise_enabled: bool = True
    rounding_enabled: bool = True
    noise_epsilon: float = settings.PRIVACY_NOISE_EPSILON

privacy_policy = PrivacyPolicy()
