# NETRĀ Threat Model (STRIDE)

This document establishes the security architecture and threat landscape for Netrā according to the STRIDE threat categorization framework.

---

## 1. Threat Actors & Personas

| Actor | Capability / Access | Objective / Vector |
| :--- | :--- | :--- |
| **Malicious Merchant** | Authenticated via valid token | Attempts to snoop on neighboring stores' prices/revenues; attempts sliding-window reconstruction attacks; seeks competitive advantage. |
| **Account Compromiser** | Stolen credentials / session hijack | Attempts IDOR to access victim's cash flow, transaction history, or recommendations. |
| **Malicious Internal / Analyst** | Internal system access | Attempts to dump unaggregated raw transaction tables or customer UPI identifiers. |
| **Prompt Injection Adversary** | Crafting inputs to merchant feedback/query APIs | Attempts to jailbreak the LLM into disclosing raw transaction data or generating price-fixing recommendations. |
| **Network Snooper** | Eavesdropping on HTTP/WebSocket | Attempts to intercept tokens or financial projections in transit. |

---

## 2. STRIDE Threat Mapping & Mitigations

### 2.1 Spoofing (Identity)
- **Threat**: Forging JWT tokens, merchant ID substitution in API payloads.
- **Mitigation**: 
  - Cryptographically signed HS256/RS256 short-lived JWT tokens.
  - Server-side identity resolution: APIs NEVER trust client-supplied `merchant_id` parameter; identity is extracted exclusively from validated JWT claims in dependency injection (`get_current_merchant`).

### 2.2 Tampering (Data Integrity)
- **Threat**: Tampering with merchant historical revenue records or synthetic stream.
- **Mitigation**:
  - Read-only analytics views over transaction partitions.
  - Append-only audit logs.
  - Pydantic input schemas strictly validating payload types and ranges.

### 2.3 Repudiation (Audit & Accountability)
- **Threat**: Merchant or admin denying an action (e.g., viewing sensitive reports, accepting recommendation).
- **Mitigation**:
  - Centralized append-only `audit_events` table logging all access, suppressions, logins, and recommendation lifecycles.

### 2.4 Information Disclosure (Privacy & Surveillance)
- **Threat**: Inferring Store B's transaction value by differencing two cohort queries (Differencing Attack / 4-Merchant Dilemma).
- **Mitigation**:
  - **Cohort Thresholds**: Minimum 10 merchants per market cluster, 8 per category.
  - **Adaptive Expansion**: Expanding radius (1km -> 3km -> 5km) before emitting any signal.
  - **Automatic Suppression**: Returning `PRIVACY_SUPPRESSED` if threshold unmet.
  - **Anti-Reconstruction Sentinel**: Rate limits, 15 queries/day budget, and sliding-window diff rejection.
  - **Zero Competitor PII**: System mathematically has no code path that outputs competitor names, exact locations, or individual prices.

### 2.5 Denial of Service (Availability)
- **Threat**: Burst querying sensitive analytics endpoints to exhaust database compute or trigger denial of service.
- **Mitigation**:
  - Sliding-window Redis / In-Memory rate limiting per merchant IP and token.
  - Async FastAPI endpoints with bounded database query pools.

### 2.6 Elevation of Privilege (Authorization)
- **Threat**: Merchant accessing Admin Security Sentinel or analyst querying raw transaction zone.
- **Mitigation**:
  - Role-Based Access Control (RBAC) with distinct roles: `MERCHANT`, `ANALYST`, `ADMIN`, `PRIVACY_AUDITOR`.
  - Least privilege database user credentials separating Raw Zone from Analytics Zone.

---

## 3. LLM Safety & Prompt Injection Defense

Any prompt sent to external AI providers (such as Sarvam AI or Anthropic/Gemini) undergoes pre-prompt sanitization:
1. **Pre-Sanitization**: All merchant IDs, names, phone numbers, and raw itemized transactions are stripped; only high-level anonymized category velocity and seasonality tokens are passed.
2. **Post-Generation Safety Gate**: Output is evaluated against regex and classification rules:
   - Blocks any mention of competitor shop names.
   - Blocks price-matching language (e.g., *"charge ₹X like your neighbor"*).
   - Blocks price coordination phrasing (e.g., *"everyone in area agree on ₹Y"*).
   - On violation: LLM response is discarded, security event logged, and safe deterministic template recommendation returned.
