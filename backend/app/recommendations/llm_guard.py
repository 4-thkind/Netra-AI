import re
from typing import Tuple, Dict, Any, List

class LLMSafetyGuard:
    """
    Section 25: Multi-Stage Safety & Competition Validator.
    Blocks competitor identification, price matching, collusion, or PII leakage.

    Detection is intent-based, not name-based. A merchant asking for another
    store's private metrics is blocked regardless of how that store is referred
    to ("the shop next door", "other stores", a seeded name we never listed).

    Two independent stages:
      1. Coordination intent  -> price-fixing / matching / undercutting language.
      2. Competitor probe     -> (a way of pointing at another store)
                                 + (a request for a private metric).
      A metric request alone is fine ("what is my cash flow"), and a
      competitor reference alone is fine ("nearby demand is up") - it is the
      COMBINATION that reconstructs a rival's books.
    """

    # --- Stage 1: coordination / price-fixing intent (blocked on its own) ---
    COORDINATION_PATTERNS = [
        r"\bmatch(ing|es)?\b[^.?!]{0,30}\b(price|rate|₹|rs\.?\s*\d)",
        r"\b(price|rate)s?\b[^.?!]{0,20}\bmatch",
        r"\bundercut\b",
        r"\b(fix|fixing|set|agree\s+on|coordinate|coordinating|align)\b[^.?!]{0,25}\bprices?\b",
        r"\bprice[\s-]*fix",
        r"\bcollud|collusion\b",
        r"\b(everyone|all\s+(the\s+)?(shops?|stores?|merchants?|kiranas?))\b[^.?!]{0,40}\b(should|must|charge|raise|lower|keep)\b",
        r"\b(let'?s|we\s+all|together)\b[^.?!]{0,30}\b(raise|increase|lower|drop|hike|fix)\b[^.?!]{0,20}\b(price|rate)",
        r"\b(raise|increase|hike|lower|drop)\b[^.?!]{0,20}\bprices?\b[^.?!]{0,20}\btogether\b",
        r"\bcartel\b",

        # --- Price-cut-to-benchmark ---------------------------------------
        # An LLM will happily write "reduce your snack price from Rs48 to
        # Rs36" - a margin-destroying race to the market median, which is
        # exactly the behaviour this product must never recommend. Netrā's
        # answer is always to bundle, never to cut the unit price.
        r"\b(reduce|lower|drop|cut|decrease|bring\s+down)\b[^.?!]{0,40}"
        r"\b(price|rate|pricing|ticket|mrp)\b[^.?!]{0,40}"
        r"(from|to)\s*(₹|rs\.?\s*)?\d",
        r"\b(price|rate|pricing)\b[^.?!]{0,25}\b(down\s+to|to\s+match|in\s+line\s+with)\b",
        r"\b(align|adjust|bring)\b[^.?!]{0,30}\b(price|pricing|rate|ticket)\b"
        r"[^.?!]{0,30}\b(median|average|benchmark|market)\b",
        # Hindi: कीमत/दाम/रेट ... कम करें / घटाएं
        r"(कीमत|दाम|रेट|मूल्य)[^।.!?]{0,40}(कम\s*कर|घटा|कमी)",
    ]

    # --- Stage 2a: ways of pointing at ANOTHER merchant ---
    COMPETITOR_REF_PATTERNS = [
        r"\bcompetitor",
        r"\brival",
        r"\bother\s+(shops?|stores?|merchants?|kiranas?|sellers?|dukaan)",
        r"\b(shop|store|kirana|dukaan|merchant)s?\s+(next\s+door|nearby|near\s+me|around\s+(me|here)|beside\s+me|opposite)",
        r"\b(nearby|local|surrounding|neighbou?ring)\s+(shops?|stores?|merchants?|kiranas?|dukaan)",
        r"\bcheapest\b",
        r"\b(bagal|paas|padosi|saamne|doosri|dusri)\s+(ki|ka|wali|wala)?\s*(dukaan|shop|store)",
        r"\bdukaan\s*(ka|ki)\b",
        r"\b(shops?|stores?|kiranas?|merchants?)\s+in\s+(my|the|this)\b",
        r"\b(next\s+door|neighbou?r(ing|s)?)\b[^.?!]{0,15}\b(shop|store|kirana|dukaan|merchant)",
        r"\bneighbou?r'?s?\b",
        r"\b(that|the|this)\s+(other\s+)?(shop|store|kirana|dukaan)\b",
        r"\bany\s+(other\s+)?(shop|store|merchant)",
        r"\bwhich\s+(shop|store|merchant|kirana)",
        r"\bcheapest\s+(shop|store|seller|kirana|place)",
        r"\b(shops?|stores?|merchants?|kiranas?)\s+(in|around|near)\s+(my|this|the)\s+(area|market|lane|street|pin\s*code|locality)",
        # a specific named business: "Gupta Store", "Shree Ram Provision", "Patel Brothers".
        # Suffix-driven so it catches shop names we never enumerated.
        r"\b[A-Z][a-z]{2,}(\s+[A-Z][a-z]{2,})?\s+(General\s+|Daily\s+|Super\s*)?"
        r"(Store|Stores|Kirana|Provision|Provisions|Traders|Trading|Brothers|Mart|Needs|Enterprises|Agency)\b",
    ]

    # --- Stage 2b: private, merchant-level metrics ---
    PRIVATE_METRIC_PATTERNS = [
        r"\b(price|prices|pricing|rate|rates|charging|charges?|charge|cost(s|ing)?)\b",
        # "sell milk for", "selling atta for", "sells it for"
        r"\bsell(s|ing)?\b[^.?!]{0,25}\bfor\b",
        r"\bcheap(est|er)?\b",
        r"\b(lowest|highest|best)\s+(price|rate|cost)",
        r"\b(revenue|turnover|sales|earning|earnings|income|profit|margin|gmv)\b",
        r"\b(how\s+much)\b",
        r"\b(transaction|txn|footfall|customer\s+count|volume|inventory|stock\s+level|supplier|discount)\b",
        r"\b(kitna|kitne|daam|bhav|keemat|rate\s+kya)\b",
    ]

    # Legitimate aggregate/market framing - Netrā's own insight vocabulary.
    # Presence of these signals market-level context rather than a rival probe.
    AGGREGATE_SAFE_PATTERNS = [
        r"\b(median|average|mean|percentile|p25|p75|quartile|benchmark|aggregate[ds]?|anonymi[sz]ed)\b",
        r"\b(cluster|micro[\s-]*market|category|market)\s+(median|average|benchmark|trend|velocity|demand|range|rate)\b",
        r"\bacross\s+\d+\+?\s+(stores?|merchants?|kiranas?)\b",
        r"\bbroader\s+(market|category|cluster)\b",
        r"\bcategory\s+(median|benchmark|average|range)\b",
    ]

    @staticmethod
    def _matches(patterns: List[str], text: str) -> str:
        for p in patterns:
            if re.search(p, text, re.IGNORECASE):
                return p
        return ""

    @staticmethod
    def validate_content(text: str) -> Tuple[bool, str]:
        if not text or not text.strip():
            return True, "Safe"

        # Stage 1 - coordination intent is unsafe by itself, aggregate framing
        # never excuses it.
        hit = LLMSafetyGuard._matches(LLMSafetyGuard.COORDINATION_PATTERNS, text)
        if hit:
            return False, f"Blocked unsafe pattern violating competition policy: price coordination intent ('{hit}')"

        # Stage 2 - competitor reference AND a private metric request.
        ref = LLMSafetyGuard._matches(LLMSafetyGuard.COMPETITOR_REF_PATTERNS, text)
        metric = LLMSafetyGuard._matches(LLMSafetyGuard.PRIVATE_METRIC_PATTERNS, text)
        if ref and metric:
            # Aggregate framing rescues Netrā's own market-level language,
            # e.g. "median snack ATV across 42 stores".
            if LLMSafetyGuard._matches(LLMSafetyGuard.AGGREGATE_SAFE_PATTERNS, text):
                return True, "Safe"
            return False, (
                "Blocked unsafe pattern violating competition policy: "
                f"individual merchant probe ('{ref}' + '{metric}')"
            )

        return True, "Safe"

    @staticmethod
    def sanitize_prompt_context(raw_context: Dict[str, Any]) -> Dict[str, Any]:
        safe_keys = ["category", "market_velocity", "seasonality", "day_of_week", "general_trend"]
        return {k: v for k, v in raw_context.items() if k in safe_keys}

llm_safety_guard = LLMSafetyGuard()
