# NETRĀ System Architecture

> **Tagline:** Network intelligence without merchant exposure.

---

## 1. System Overview & Data Flow

```
┌────────────────────────────────────────────────────────┐
│ 1. TRANSACTION INGESTION & RESTRICTED RAW DATA ZONE    │
│    • Mock Paytm Soundbox / UPI QR Events               │
│    • Merchant-specific partitioned tables              │
│    • Direct analytical queries strictly restricted     │
└──────────────────────────┬─────────────────────────────┘
                           │ (Scheduled Batch ETL & Features)
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. PRIVACY TRANSFORMATION & SANITIZATION LAYER         │
│    • Spatial H3 / Micro-market Cluster Mapper          │
│    • Small-Cohort Suppression Gate (N ≥ 10)            │
│    • Adaptive Multi-Tier Expansion (1km ➔ 3km ➔ 5km)   │
│    • Anti-Reconstruction Differential Slicing Sentinel │
│    • Differential Noise Injection & Metric Binning     │
└──────────────────────────┬─────────────────────────────┘
                           │ (Safe Aggregate Features Only)
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. ANALYTICS & INTELLIGENCE ENGINES                    │
│    • Trade Radar (Hyperlocal category velocity)        │
│    • Price Pulse (Category ATV benchmark ranges)       │
│    • Cash Flow Prophet (7-day working capital forecast)│
│    • Festival Engine (Regional Indian calendar sync)   │
│    • Growth Missions (Anonymized cohort benchmarking)  │
└──────────────────────────┬─────────────────────────────┘
                           │ (Candidate Recommendations)
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. RECOMMENDATION ORCHESTRATION & LLM SAFETY GATE      │
│    • Cognee Merchant Memory (Profile & feedback)       │
│    • Pre-LLM Context Sanitization (No PII / no names)  │
│    • Sarvam AI Indic Multilingual & Voice Adapter      │
│    • Post-LLM Safety Validator (Block price matching,  │
│      competitor naming, price fixing)                  │
└──────────────────────────┬─────────────────────────────┘
                           │ (Approved Safe Recommendations)
                           ▼
┌────────────────────────────────────────────────────────┐
│ 5. MERCHANT EXPERIENCE & OPERATIONAL SURFACES          │
│    • Kirana Merchant Web Copilot (Wine & Creme theme)  │
│    • Soundbox / Voice Playback Action Cards            │
│    • Privacy Center & Data Boundary Explainer          │
│    • Security Sentinel & Audit Dashboard (Admin)       │
│    • Interactive Hackathon Attack Simulation Suite     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Core Service Modules

### `backend/app/privacy/`
- `policies.py`: Defines immutable policy constraints (`MIN_MARKET_MERCHANTS = 10`, `MIN_CATEGORY_MERCHANTS = 8`, `MAX_QUERIES_PER_WINDOW = 15`).
- `geographic_privacy.py`: Maps merchant locations to coarse micro-market clusters without exposing precise coordinates.
- `suppression.py`: Evaluates merchant density and triggers adaptive radius expansion (1km -> 3km -> 5km) or emits standard privacy suppression response.
- `query_budget.py`: Enforces sliding-window query budget to prevent mathematical differencing attacks.
- `reconstruction_guard.py`: Detects repeated semantic queries across close geographical bounds.

### `backend/app/analytics/`
- `trade_radar.py`: Compares merchant category sales velocity against privacy-safe cluster demand trends to surface inventory expansion opportunities.
- `price_pulse.py`: Computes P25, Median, and P75 Average Transaction Value (ATV) distributions per category. Recommends bundle creation or packaging tweaks—strictly forbidding direct price matching.
- `cashflow.py`: Generates 7-day projected cash inflows, flagged liquidity pinches, and vendor payment scheduling recommendations based solely on merchant's own historic UPI/cash volume.
- `festival.py`: Indian regional festive demand forecaster (Navratri, Diwali, Holi, Eid, etc.) with automated T-14 inventory warnings.
- `growth_missions.py`: Structured, measurable weekly goals derived from broad cohort performance.

### `backend/app/recommendations/`
- `recommendation_service.py`: Assembles structured recommendation objects with evidence and confidence scores.
- `llm_guard.py`: AST and regex validation blocking competitor mentions, collusion phrases, and ungrounded statements.
- `feedback_service.py`: Ingests merchant action feedback (`accepted`, `rejected`, `dismissed`) to update Cognee knowledge memory.

### `backend/app/integrations/`
- `sarvam_adapter.py`: Interfaces with Sarvam AI API for Indic language synthesis (Hindi text generation & TTS audio output).
- `cognee_adapter.py`: Graph memory abstraction storing merchant profile preferences.
- `n8n_adapter.py`: Webhook emitter for workflow automation (Daily EOD, Festival T-14, Weekly Growth Missions).
- `paytm_adapter.py`: Mock streaming ingestion replicating Paytm UPI Soundbox payment webhooks.
