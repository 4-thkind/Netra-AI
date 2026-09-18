code = '''import re
from typing import Tuple, Dict, Any

class LLMSafetyGuard:
    """
    Section 25: Multi-Stage Safety & Competition Validator.
    Blocks competitor identification, price matching, collusion, or PII leakage.
    """
    FORBIDDEN_PATTERNS = [
        r"competitor\s+(charging|selling|price|reduced|discount)",
        r"(store|shop)\s+[A-Z][a-z]+\s+(sells|charges|price)",
        r"match\s+(the\s+)?₹?\d+\s+price",
        r"cheapest\s+shop",
        r"price\s+nearby",
        r"everyone\s+.*charge",
        r"fix\s+.*price",
        r"coordinate\s+.*price",
        r"price\s*fixing",
        r"undercut\s+(them|neighbor|store)",
        r"gupta\s+(store|general)",
        r"aggarwal\s+(store|super)",
        r"verma\s+daily"
    ]

    @staticmethod
    def validate_content(text: str) -> Tuple[bool, str]:
        for pattern in LLMSafetyGuard.FORBIDDEN_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return False, f"Blocked unsafe pattern violating competition policy: '{pattern}'"
        return True, "Safe"

    @staticmethod
    def sanitize_prompt_context(raw_context: Dict[str, Any]) -> Dict[str, Any]:
        safe_keys = ["category", "market_velocity", "seasonality", "day_of_week", "general_trend"]
        return {k: v for k, v in raw_context.items() if k in safe_keys}

llm_safety_guard = LLMSafetyGuard()
'''

with open("backend/app/recommendations/llm_guard.py", "w") as f:
    f.write(code)

print("llm_guard.py updated successfully.")
