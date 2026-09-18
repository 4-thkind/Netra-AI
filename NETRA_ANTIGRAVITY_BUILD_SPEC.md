# NETRĀ — Antigravity Build Specification

> **Purpose:** This document is the single source of truth for building the Netrā prototype in Antigravity.  
> **Priority:** Security + privacy + competition-safe intelligence > correctness > reliability > UX polish > visual effects.

---

## 1. Product Overview

**Netrā** is an AI Growth Copilot for Indian kirana merchants.

The core idea is:

```text
Transaction Signals
        ↓
Privacy-Safe Aggregation
        ↓
Market + Merchant Intelligence
        ↓
Recommendation Engine
        ↓
Merchant Action
        ↓
Outcome Measurement
        ↓
Learning / Feedback Loop
```

Netrā should help merchants make better decisions about:

- demand
- inventory
- offers
- cash flow
- seasonal/festival preparation
- business growth

It should **not** become a competitor-surveillance or price-coordination system.

The existing concept describes:
- hyperlocal demand trends
- competitive/market pricing context
- festival prediction
- 7-day cash-flow forecasting
- cohort-based growth missions
- merchant-specific knowledge memory
- Sarvam AI
- Cognee
- n8n
- PostgreSQL
- Redis
- FastAPI

---

# 2. PRIMARY PRODUCT PRINCIPLE

## "Network intelligence without merchant exposure."

Netrā can learn from network-level patterns, but an individual merchant must never be able to identify or reconstruct another merchant's:

- price
- revenue
- transaction history
- inventory
- promotion
- customer behavior
- performance
- identity
- exact location

The system must enforce this at the **backend/data layer**, not merely through frontend wording.

---

# 3. CRITICAL COMPETITION CONCERN

### Problem scenario

Suppose four kirana stores operate within approximately 1 km.

A dangerous system could tell each merchant:

> "The shop near you sells this for ₹35. You should sell it for ₹34."

This can turn an intelligence product into a mechanism that facilitates competitor monitoring or coordinated pricing.

Netrā must therefore **never** create this data flow:

```text
Merchant A price
       ↓
Merchant B sees A's price
       ↓
Merchant B changes price
```

Instead:

```text
Aggregated market pattern
       +
Merchant's own historical performance
       ↓
Business opportunity
       ↓
Safe action recommendation
```

---

# 4. COMPETITION-SAFE PRICE PULSE

Price Pulse is **market context**, not competitor tracking.

### Allowed

Examples:

> "Snack transaction values are above the broader category benchmark."

> "Demand in the beverage category has increased."

> "Your snack volume has fallen while your transaction value remains above the broader category range."

> "Consider testing a bundle instead of making a permanent price change."

### Forbidden

Never generate:

> "Store X sells this for ₹35."

> "Your competitor reduced their price."

> "Match the ₹35 price nearby."

> "Everyone in your area should charge ₹39."

> "The cheapest shop near you is charging ₹32."

The recommendation engine must actively block these patterns.

---

# 5. SMALL-COHORT PROTECTION

This is a mandatory privacy mechanism.

Assume:

```text
1 km market
4 merchants
```

Netrā must **not** expose a sensitive local aggregate that could reveal information about those merchants.

Use a configurable minimum cohort threshold.

Example:

```env
MIN_MARKET_MERCHANTS=10
MIN_CATEGORY_MERCHANTS=8
```

If the cohort is too small:

```text
1 km
 ↓ insufficient cohort
3 km
 ↓ insufficient cohort
5 km
 ↓ sufficient cohort
Generate aggregate signal
```

If sufficient aggregation cannot be achieved:

```text
SUPPRESS SIGNAL
```

The merchant should receive:

> "We don't have enough local signal to provide a reliable market insight yet."

Do **not** reveal the exact number of merchants or the reason in a way that allows inference.

---

# 6. PRIVACY AGGREGATION SERVICE

Create a dedicated module:

```text
backend/app/privacy/
├── policies.py
├── aggregation.py
├── suppression.py
├── query_budget.py
├── reconstruction_guard.py
├── geographic_privacy.py
└── audit.py
```

All network-level analytics must pass through this layer.

Architecture:

```text
Raw Transactions
       ↓
Restricted Data Boundary
       ↓
Feature Extraction
       ↓
Privacy Aggregation
       ↓
Cohort Validation
       ↓
Suppression / Noise / Rounding
       ↓
Privacy-Safe Analytics
       ↓
Recommendation Engine
```

No intelligence model should directly query unrestricted raw transaction tables for market insights.

---

# 7. PRIVACY POLICY OBJECT

Create a centralized policy abstraction.

Example conceptual interface:

```python
class PrivacyPolicy:
    min_market_merchants: int
    min_category_merchants: int
    geographic_expansion_enabled: bool
    max_sensitive_queries_per_window: int
    rounding_enabled: bool
    noise_enabled: bool
```

The exact implementation may vary, but privacy rules must not be scattered throughout unrelated services.

---

# 8. QUERY PRIVACY + ANTI-RECONSTRUCTION

A malicious user could try:

```text
Query category A
Query category B
Query yesterday
Query today
Query 1 km
Query 1.1 km
Query 1.2 km
```

and reconstruct hidden information.

Implement:

### Query budget

Track sensitive analytics requests per merchant/session.

### Similar-query detection

Detect repeated queries over:

- same geographic bucket
- same category
- overlapping time windows
- slightly modified geographic ranges

### Stable aggregation windows

Do not return a materially different statistic for every tiny query variation.

### Suppression

Reject unsafe queries.

### Rate limiting

Use Redis.

### Audit

Record privacy decisions without storing unnecessary sensitive data.

---

# 9. GEOGRAPHIC PRIVACY

Do not expose exact merchant coordinates.

Prefer geographic buckets such as H3/geohash.

Use concepts like:

```text
geographic_bucket
market_cluster
micro_market
```

rather than:

```text
latitude
longitude
exact competitor location
```

The UI should communicate broader local-market intelligence, not competitor locations.

---

# 10. RAW DATA BOUNDARY

Architect the system into zones:

```text
┌─────────────────────────────┐
│ RAW DATA ZONE               │
│ Highly restricted           │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ PRIVACY TRANSFORMATION ZONE  │
│ Aggregation + suppression    │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ ANALYTICS ZONE              │
│ Safe market features        │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ RECOMMENDATION ZONE         │
│ Merchant-specific decisions │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ DELIVERY                    │
│ App / Soundbox / WhatsApp   │
└─────────────────────────────┘
```

LLMs should receive only the minimum context required.

---

# 11. DATABASE ARCHITECTURE

Use PostgreSQL as the primary database.

Logical schemas:

```text
identity
merchant
transaction
analytics
recommendation
privacy
audit
experimentation
```

Potential tables:

## merchants

```text
id
external_id_hash
category
language
city
pin_code_hash
created_at
updated_at
```

## merchant_preferences

```text
merchant_id
language
preferred_channel
notification_preferences
risk_preferences
created_at
updated_at
```

## transactions

```text
id
merchant_id
category_id
amount
timestamp
location_bucket
```

Avoid unnecessary customer PII.

## market_clusters

```text
id
geographic_bucket
radius
category
created_at
```

## market_aggregates

```text
market_id
category_id
time_window
merchant_count
transaction_count
median_atv
p25_atv
p75_atv
volume_velocity
confidence
privacy_status
```

## recommendations

```text
id
merchant_id
recommendation_type
recommendation_payload
reason
confidence
created_at
expires_at
status
```

## recommendation_outcomes

```text
recommendation_id
merchant_id
action_taken
action_timestamp
outcome_metrics
success
created_at
```

## audit_events

Append-only audit/security records.

---

# 12. DATABASE SECURITY

Implement:

- least-privilege database roles
- connection pooling
- migrations
- foreign keys
- constraints
- encrypted connections in production
- backup strategy
- restore strategy
- retention policies
- audit logging
- appropriate indexes
- transaction integrity

For high-volume transactions, design for partitioning by time where appropriate.

Do not allow the frontend to query analytical tables directly.

---

# 13. MULTI-TENANT SECURITY

Every merchant request must resolve the authenticated merchant server-side.

Do not trust:

```text
merchant_id
```

from the frontend.

Use:

```text
Authenticated Identity
        ↓
Merchant Identity
        ↓
Authorization
        ↓
Resource Access
```

Use PostgreSQL Row Level Security where appropriate.

Test for IDOR:

```text
Merchant A tries to access Merchant B's recommendation
→ DENY
```

---

# 14. AUTHENTICATION

Use secure authentication with:

- short-lived access tokens
- refresh-token rotation
- secure cookie/session strategy where appropriate
- password hashing if passwords are used
- session invalidation
- login attempt protection

Never hardcode secrets.

Provide:

```text
.env.example
```

and ensure:

```text
.env
```

is ignored by git.

---

# 15. AUTHORIZATION

Roles:

```text
MERCHANT
ANALYST
ADMIN
SERVICE
PRIVACY_AUDITOR
```

Apply least privilege.

A merchant should never have access to administrative analytics.

A normal analyst should not automatically receive raw transaction access.

---

# 16. FASTAPI API

Use versioned APIs.

Suggested structure:

```text
/api/v1/auth
/api/v1/merchant
/api/v1/insights
/api/v1/recommendations
/api/v1/trade-radar
/api/v1/price-pulse
/api/v1/festival
/api/v1/cashflow
/api/v1/growth
/api/v1/privacy
/api/v1/health
```

Use:

- Pydantic validation
- typed request/response models
- authorization middleware
- rate limiting
- request-size limits
- CORS restrictions
- security headers
- timeouts
- idempotency for actions
- structured errors
- API versioning

Never expose stack traces.

---

# 17. REDIS

Use Redis for:

- rate limiting
- caching
- temporary session data
- idempotency keys
- workflow locks
- privacy query budgets
- short-lived recommendation cache

Do not use Redis as the permanent source of truth.

---

# 18. TRADE RADAR

Trade Radar identifies demand opportunities.

Inputs:

```text
Privacy-safe market demand
+
Merchant's own category activity
+
Seasonality
+
Historical outcomes
```

Possible signals:

- category demand increase
- product/category gap
- emerging demand
- seasonal opportunity

Example:

> "Beverage demand is increasing in your broader market. You currently have limited activity in this category."

Then:

> "Consider reviewing beverage inventory."

Avoid:

> "Store X is selling 20 units of this."

---

# 19. PRICE PULSE

Use:

```text
Aggregate category statistics
+
Merchant's own historical baseline
+
Volume trend
+
Demand sensitivity
```

Possible metrics:

- median ATV
- P25/P75
- rolling 30-day distributions
- volume change
- merchant deviation from broader benchmark

Example internal data:

```json
{
  "market_id": "market_abc",
  "category": "snacks",
  "merchant_count": 27,
  "median_atv": 35,
  "p25": 30,
  "p75": 42,
  "volume_change_7d": 0.08
}
```

Merchant-facing response:

```json
{
  "signal": "pricing_context",
  "message": "Your snack transaction value is above the broader local category range.",
  "recommended_action": "Test a bundle rather than making a permanent price change.",
  "confidence": 0.81
}
```

Never return individual competitor prices.

---

# 20. CASH FLOW PROPHET

Use merchant's own historical financial behavior and appropriate privacy-safe features.

Pipeline:

```text
Historical daily data
       ↓
Feature engineering
       ↓
Seasonality
       ↓
Day-of-week effects
       ↓
Forecast
       ↓
7-day projection
       ↓
Risk detection
       ↓
Action recommendation
```

Do not expose merchant financial information to other merchants.

Forecast outputs should include:

```text
forecast
confidence interval
risk flag
explanation
recommended action
```

---

# 21. FESTIVAL ENGINE

Maintain:

```text
festival_calendar
festival_patterns
merchant_festival_history
festival_recommendations
```

Pipeline:

```text
Festival Calendar
       ↓
Merchant historical behavior
       ↓
Seasonal patterns
       ↓
Inventory opportunity
       ↓
Offer generation
       ↓
Language localization
       ↓
Merchant approval
       ↓
Delivery
```

The system should support Indian regional festivals and seasons.

Do not automatically send offers or change prices without merchant authorization.

---

# 22. GROWTH MISSIONS

Growth Missions use privacy-safe cohorts.

Example:

> "Similar stores in your category saw stronger results after testing this type of bundle."

Do not say:

> "Ramesh's neighboring store did this."

Cohorts may consider:

- merchant category
- broad location tier
- revenue band
- transaction volume
- business characteristics

Cohorts must remain large enough to prevent inference.

---

# 23. COGNEE

Use Cognee as merchant-specific knowledge/memory.

Store useful structured memory such as:

- preferences
- successful actions
- failed actions
- seasonal patterns
- language
- feedback
- recommendation adoption
- cohort membership

Avoid dumping unrestricted raw transactions into the knowledge graph.

Architecture:

```text
PostgreSQL
   ↓
Feature extraction
   ↓
Merchant-safe profile
   ↓
Cognee
   ↓
Context retrieval
   ↓
Recommendation Engine
```

---

# 24. SARVAM AI

Use Sarvam for multilingual generation/TTS.

Send minimum required context.

Safe example:

```json
{
  "language": "hi",
  "insight": "beverage_demand_up",
  "merchant_context": {
    "merchant_category": "kirana"
  },
  "recommended_action": "review beverage inventory"
}
```

Do not send unnecessary:

- raw transaction history
- competitor records
- customer PII
- raw database rows
- exact merchant identifiers

---

# 25. LLM SAFETY LAYER

Every LLM-generated recommendation must pass through:

```text
LLM
 ↓
Output Parser
 ↓
Policy Validator
 ↓
Privacy Validator
 ↓
Competition-Safety Validator
 ↓
Recommendation
```

Block:

- competitor identification
- individual competitor pricing
- price coordination
- PII leakage
- unsupported statistics
- hallucinated evidence
- unsafe financial claims

If blocked:

```text
Reject output
+
generate safe fallback
+
audit event
```

---

# 26. RECOMMENDATION OBJECT

Every recommendation should have:

```json
{
  "recommendation": "...",
  "reason": "...",
  "evidence": [],
  "confidence": 0.0,
  "expected_action": "...",
  "expires_at": "...",
  "safety_status": "approved"
}
```

Never fabricate evidence.

---

# 27. FEEDBACK LOOP

The system should learn from merchant actions.

```text
Recommendation
      ↓
Merchant Action
      ↓
Observed Outcome
      ↓
Outcome Store
      ↓
Feature Update
      ↓
Knowledge Graph Update
      ↓
Future Recommendation
```

Track:

- accepted
- rejected
- ignored
- completed
- outcome

Do not treat correlation as guaranteed causation.

---

# 28. N8N

Use n8n for workflow orchestration.

Examples:

### Daily EOD

```text
EOD
 ↓
Cash Flow Forecast
 ↓
Risk Detection
 ↓
Recommendation
 ↓
Merchant Notification
```

### Festival

```text
Festival T-14
 ↓
Festival Engine
 ↓
Offer
 ↓
Merchant Approval
 ↓
WhatsApp/SMS
```

### Weekly Growth Mission

```text
Weekly Trigger
 ↓
Cohort Recommendation
 ↓
Safety Filter
 ↓
Merchant Delivery
```

Security-critical authorization must remain in FastAPI/backend.

n8n is orchestration, not the source of truth.

---

# 29. FRONTEND VISUAL SYSTEM

The frontend must match the existing Netrā PPT visual identity.

## Palette

```css
--wine: #722F37;
--cream: #FFF8F0;
--gold: #C9A96E;
--charcoal: #2D2D2D;
--muted-wine: #8B4049;
--soft-sand: #F5EDE3;
```

## Typography

Use a pairing similar to:

```text
Poppins → headings
Inter → body/interface text
```

## Style

Use:

- rounded cards
- subtle shadows
- premium whitespace
- thin elegant dividers
- gold accents
- wine primary elements
- creme backgrounds
- soft-sand cards
- simple line icons
- subtle animations

Avoid:

- generic blue SaaS
- purple AI gradients
- neon
- excessive glassmorphism
- cluttered admin dashboards
- excessive charts
- robot/AI stock illustrations

The UI should feel like the PPT became a real product.

---

# 30. MERCHANT HOME

Example:

```text
Good morning, Ramesh.

TODAY'S SIGNAL

Beverage demand is rising
in your broader local market.

[View Insight]

────────────────────

Trade Radar
Price Pulse
Cash Flow
Festival Engine
Growth Mission
```

Cards should use the Netrā visual language.

---

# 31. INSIGHT CARD

Every insight should answer:

```text
WHAT?
WHY?
SO WHAT?
WHAT SHOULD I DO?
```

Example:

```text
WHAT?
Cold beverage demand is rising.

WHY?
The broader market shows increased category activity.

SO WHAT?
Your beverage activity has not increased at the same pace.

ACTION
Review beverage inventory.

[Take Action]
```

---

# 32. PRIVACY CENTER

Create a visible Privacy Center.

Sections:

### What Netrā uses

- aggregated transaction patterns
- merchant's own business history
- seasonal signals
- privacy-safe cohort statistics

### What Netrā never shares

- another merchant's identity
- another merchant's individual price
- another merchant's revenue
- exact competitor location
- raw transaction records

### How market intelligence works

Show:

```text
Many merchants
      ↓
Aggregated pattern
      ↓
Privacy checks
      ↓
Market signal
      ↓
Your recommendation
```

---

# 33. ADMIN SECURITY DASHBOARD

Create an internal security view containing:

```text
Privacy Suppressions
Blocked Analytics Queries
Blocked LLM Outputs
Authorization Failures
Rate Limit Events
Data Access Events
Security Alerts
Recommendation Safety Events
```

Do not show raw merchant data.

---

# 34. AUDIT LOGGING

Record security-sensitive events such as:

```text
AUTH_LOGIN
AUTH_FAILURE
RESOURCE_ACCESS
MARKET_INSIGHT_REQUEST
PRIVACY_SUPPRESSION
PRIVACY_POLICY_PASS
LLM_OUTPUT_BLOCKED
RECOMMENDATION_CREATED
RECOMMENDATION_ACCEPTED
RECOMMENDATION_REJECTED
ADMIN_ACTION
```

Logs must avoid unnecessary PII.

---

# 35. OBSERVABILITY

Implement:

- structured logs
- health checks
- readiness checks
- latency metrics
- database metrics
- ML inference metrics
- recommendation metrics
- privacy suppression metrics
- security event metrics

Endpoints:

```text
/health
/ready
/metrics
```

---

# 36. SYNTHETIC DEMO DATA

The hackathon MVP should use synthetic data.

Generate:

```text
500–5000 merchants
multiple cities
multiple kirana categories
multiple geographic clusters
90+ days transaction history
festival events
demand trends
price distributions
merchant actions
recommendation outcomes
```

Mark the environment clearly:

```text
DEMO / SYNTHETIC DATA
```

Never pretend synthetic results are real Paytm data.

---

# 37. DEMO MERCHANT: RAMESH

Create a coherent end-to-end demo.

Example:

```text
Merchant:
Ramesh

Business:
Kirana

Location:
Lajpat Nagar

Language:
Hindi
```

Possible flow:

### Monday

Trade Radar:

> "Beverage demand is increasing in your broader market."

### Wednesday

Price Pulse:

> "Your snack transaction value is above the broader category range. Consider testing a bundle instead of making a permanent price change."

### Friday

Cash Flow:

> "Next week's projected cash position looks stable."

### Sunday

Growth Mission:

> "Try one new high-demand category this week and track the result."

The demo must demonstrate **decision support**, not competitor surveillance.

---

# 38. SECURITY TEST SUITE

Create explicit tests for:

## Authentication

- invalid token
- expired token
- forged token
- refresh token misuse

## Authorization

- IDOR
- merchant-to-merchant access
- admin endpoint access
- role escalation

## API

- SQL injection
- malformed payloads
- oversized requests
- rate-limit bypass
- CORS misuse

## Privacy

- small cohort suppression
- geographic expansion
- query budget
- repeated-query reconstruction
- overlapping time-window attack
- category slicing attack

## Competition safety

Test:

```text
4 merchants
→ suppress

9 merchants
→ suppress if threshold is 10

10+ merchants
→ aggregate signal may be allowed

Competitor price request
→ block

Competitor identity request
→ block

Price coordination request
→ block
```

## LLM

- prompt injection
- data exfiltration attempts
- competitor disclosure
- hallucinated evidence
- unsafe recommendation output

---

# 39. THREAT MODEL

Create:

```text
docs/THREAT_MODEL.md
```

Include at least:

### Threat actors

- malicious merchant
- compromised merchant account
- malicious internal user
- compromised API client
- prompt-injection attacker
- database compromise
- workflow compromise

### Assets

- transaction data
- merchant identity
- financial information
- market analytics
- recommendation history
- authentication credentials
- API secrets

### Controls

Map every threat to a technical mitigation.

---

# 40. PRIVACY MODEL DOCUMENT

Create:

```text
docs/PRIVACY_MODEL.md
```

Explicitly answer:

> "If there are only four kirana stores within 1 km, how does Netrā prevent the system from revealing information about those stores or enabling price coordination?"

Required answer architecture:

```text
Small cohort
 ↓
Suppression
 ↓
Adaptive geographic expansion
 ↓
Minimum cohort validation
 ↓
Aggregate-only statistics
 ↓
Query-budget protection
 ↓
Anti-reconstruction controls
 ↓
Safe recommendation policy
```

---

# 41. ARCHITECTURE DOCUMENT

Create:

```text
docs/ARCHITECTURE.md
```

Explain:

- system components
- data flow
- database architecture
- privacy boundary
- ML pipeline
- recommendation pipeline
- Sarvam integration
- Cognee integration
- n8n integration
- Redis usage
- API architecture
- security architecture
- deployment architecture
- feedback loop

---

# 42. PROJECT STRUCTURE

Preferred structure:

```text
netra/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── privacy/
│   │   ├── security/
│   │   ├── analytics/
│   │   ├── recommendations/
│   │   ├── integrations/
│   │   └── workers/
│   ├── migrations/
│   ├── tests/
│   └── Dockerfile
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── styles/
│   └── tests/
│
├── ml/
│   ├── trade_radar/
│   ├── price_pulse/
│   ├── cashflow/
│   ├── festival/
│   └── growth_missions/
│
├── n8n/
│   └── workflows/
│
├── scripts/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── PRIVACY_MODEL.md
│   └── THREAT_MODEL.md
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── SECURITY.md
└── README.md
```

---

# 43. DEVELOPMENT ORDER

Build incrementally.

## Phase 1 — Foundation

- project structure
- Docker
- PostgreSQL
- Redis
- FastAPI
- frontend
- environment configuration
- migrations

## Phase 2 — Security

- authentication
- authorization
- merchant isolation
- audit logging
- security middleware

## Phase 3 — Data

- synthetic transaction generator
- ingestion
- feature extraction
- aggregation
- privacy layer
- cohort validation

## Phase 4 — Intelligence

- Trade Radar
- Price Pulse
- Cash Flow Prophet

## Phase 5 — Action

- Festival Engine
- Growth Missions
- recommendation engine
- safety layer

## Phase 6 — Integrations

- Cognee
- Sarvam
- n8n

Integrations should be modular so the application still runs in demo mode without external credentials.

## Phase 7 — Frontend

- merchant dashboard
- insight cards
- recommendation flow
- privacy center
- security dashboard

## Phase 8 — Testing

- unit tests
- API tests
- security tests
- privacy tests
- reconstruction tests
- integration tests

## Phase 9 — Documentation

- README
- architecture
- threat model
- privacy model
- API documentation
- deployment instructions

---

# 44. DEMO MODE

The application must work without real Paytm APIs.

Provide:

```text
DEMO_MODE=true
```

In demo mode:

```text
Synthetic Data
Mock Paytm transaction stream
Mock merchant accounts
Mock Sarvam adapter
Mock Cognee adapter if credentials are unavailable
Mock n8n execution
```

The architecture should make clear where production integrations would be connected.

Never fake production credentials or pretend to have live Paytm data.

---

# 45. INTEGRATION ABSTRACTIONS

Create interfaces/adapters such as:

```text
TransactionProvider
LLMProvider
TTSProvider
KnowledgeGraphProvider
WorkflowProvider
NotificationProvider
```

Then implementations:

```text
MockTransactionProvider
PaytmTransactionProvider
SarvamLLMProvider
SarvamTTSProvider
CogneeProvider
N8NWorkflowProvider
```

This keeps the hackathon prototype deployable while preserving a credible production architecture.

---

# 46. ERROR HANDLING

All services must use structured errors.

Example:

```json
{
  "error": {
    "code": "PRIVACY_SUPPRESSED",
    "message": "This insight is currently unavailable."
  }
}
```

Do not leak:

- SQL errors
- stack traces
- internal IDs
- database structure
- secrets
- private merchant data

---

# 47. PERFORMANCE

Design for:

- batch aggregation
- caching
- asynchronous jobs
- database indexing
- background workers
- connection pooling
- efficient feature computation

Do not run expensive network analytics synchronously on every frontend request.

Prefer:

```text
Scheduled aggregation
       ↓
Cached market features
       ↓
Fast recommendation lookup
```

---

# 48. DATA RETENTION

Define retention periods for:

- raw transactions
- derived features
- recommendations
- audit logs
- privacy query logs
- authentication events

Store only what is necessary.

Document retention decisions.

---

# 49. FRONTEND SECURITY

The frontend must:

- never contain secrets
- never directly access PostgreSQL
- never trust local merchant IDs
- handle expired sessions
- sanitize/render backend content safely
- avoid unsafe HTML injection
- use secure API calls
- display generic errors

Sensitive authorization decisions must happen server-side.

---

# 50. DEFINITION OF DONE

The project is **not complete** because a dashboard renders.

It is complete when:

- application runs locally
- Docker setup works
- database migrations work
- synthetic data works
- APIs work
- authentication works
- authorization works
- merchant isolation works
- privacy layer works
- small cohorts are suppressed
- adaptive geographic aggregation works
- query reconstruction defenses work
- Price Pulse cannot expose competitor prices
- competitor-identification requests are blocked
- price-coordination recommendations are blocked
- LLM output is safety-filtered
- Trade Radar works
- Price Pulse works
- Cash Flow works
- Festival Engine works
- Growth Missions work
- feedback loop works
- Redis rate limiting works
- audit logs work
- security tests pass
- frontend matches Netrā visual identity
- demo mode works without external APIs
- documentation exists
- threat model exists
- privacy model exists

---

# 51. NON-NEGOTIABLE RULES

### Rule 1

**Never expose individual competitor information.**

### Rule 2

**Never use a small cohort to generate a potentially identifying market statistic.**

### Rule 3

**Never turn Price Pulse into a price-matching engine.**

### Rule 4

**Never let the LLM bypass privacy controls.**

### Rule 5

**Never trust frontend-supplied merchant identity.**

### Rule 6

**Never put secrets in source code.**

### Rule 7

**Never use raw transaction data in an LLM prompt unless strictly necessary and explicitly authorized.**

### Rule 8

**If privacy cannot be guaranteed, suppress the insight.**

### Rule 9

**The backend is the source of truth.**

### Rule 10

**Do not build an AI wrapper. Build an actual intelligence pipeline.**

---

# 52. FINAL PRODUCT POSITIONING

Netrā should be technically and visually communicated as:

> **A privacy-safe business intelligence layer for India's merchants.**

Not:

> competitor tracking

Not:

> price surveillance

Not:

> an AI chatbot

Not:

> a generic dashboard

The strongest product principle is:

> **Netrā turns network-scale patterns into individual business decisions without exposing the businesses behind those patterns.**

---

# 53. ANTIGRAVITY EXECUTION INSTRUCTION

Before coding:

1. Inspect the repository.
2. Identify existing code and preserve useful work.
3. Produce an architecture plan.
4. Produce the threat model.
5. Produce the privacy model.
6. Identify security-sensitive data flows.
7. Identify all external integrations.
8. Identify what can run in demo mode.
9. Define database schema and migrations.
10. Then implement incrementally.

After every major phase:

```text
Run tests
Check logs
Check API contracts
Check privacy invariants
Check merchant isolation
Check frontend/backend integration
```

Do not silently make major architectural assumptions.

When something cannot safely be implemented, prefer a **safe fallback** over weakening privacy/security.

---

# 54. FINAL DESIGN TEST

Before considering Netrā complete, test this scenario:

```text
There are four kirana stores in a 1 km area.

Merchant A asks:
"What are my competitors charging?"

Expected:
No competitor-specific information.

Merchant A asks:
"What should I charge to beat them?"

Expected:
No competitor-based price recommendation.

Merchant A asks:
"How is my category performing?"

Expected:
Only privacy-safe aggregate information.

Merchant A asks repeatedly with slightly different geographic/category queries.

Expected:
Privacy budget / reconstruction defenses prevent inference.

Netrā does not have enough merchants to safely generate an insight.

Expected:
Insight suppressed or aggregated over a larger privacy-safe cohort.

Netrā detects a business opportunity.

Expected:
Recommendation focuses on inventory, bundles, timing, demand, customer engagement, or other legitimate business actions rather than coordinating prices.
```

If this test passes, the core privacy/competition architecture is behaving as intended.

---

## SOURCE VISUAL DIRECTION

Use the existing Netrā presentation as the visual reference:

- Wine `#722F37`
- Creme White `#FFF8F0`
- Soft Gold `#C9A96E`
- Charcoal `#2D2D2D`
- Soft Sand `#F5EDE3`
- Poppins-style headings
- Inter-style body text
- rounded cards
- generous whitespace
- subtle network texture
- premium warm-minimal aesthetic

The visual system should feel consistent across the landing page, merchant dashboard, insight cards, architecture views, privacy center and admin/security views.

---

## END STATE

The final result should feel like a **credible production architecture demonstrated through a hackathon MVP**.

A judge should be able to understand:

```text
Where data comes from
        ↓
How privacy is enforced
        ↓
How market intelligence is generated
        ↓
How recommendations are created
        ↓
How the merchant receives them
        ↓
How actions are measured
        ↓
How the system improves
```

while being able to answer the hardest question:

> **"How do you use network intelligence without turning Netrā into a tool that exposes competitors or causes price coordination?"**

The technical answer must exist in the architecture and code—not only in the presentation.
