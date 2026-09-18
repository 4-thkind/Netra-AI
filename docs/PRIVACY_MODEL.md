# NETRĀ Privacy Model & Mathematical Protections

> **Primary Principle:** *"Network intelligence without merchant exposure."*

---

## 1. The Core Dilemma: The 4-Merchant Problem

### The Scenario
Suppose four kirana stores operate within a 1 km micro-market radius in Lajpat Nagar, New Delhi.
- **Store A** (Ramesh Kirana)
- **Store B** (Gupta General Store)
- **Store C** (Aggarwal Super Mart)
- **Store D** (Verma Daily Needs)

If Netrā were to compute a naive localized average:
$$\text{Insight} = f(Store_A, Store_B, Store_C, Store_D)$$
Then Store A could subtract its own data and easily infer or reconstruct the private metrics of Store B, C, or D. Worse, an automated price recommendation system could advise:
> *"Competitors nearby are selling cold beverages at ₹38. Match ₹38."*

This would immediately enable **algorithmic price coordination** or **competitor surveillance**, violating antitrust regulations (Competition Act) and breaching merchant business confidentiality.

---

## 2. Multi-Layered Privacy Defense Architecture

Netrā solves this through a rigorous 7-stage privacy transformation pipeline:

```
┌────────────────────────────────────────────────────────┐
│ 1. Geohash / H3 Micro-Market Bucketing                 │
│    (Eliminates exact GPS coordinates)                  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Minimum Cohort Size Validation                      │
│    (Threshold: MIN_MARKET_MERCHANTS ≥ 10,              │
│                MIN_CATEGORY_MERCHANTS ≥ 8)             │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             │ Cohort ≥ 10?              │
             │                           │
            YES                          NO
             │                           │
             │             ┌─────────────▼──────────────┐
             │             │ Adaptive Expansion         │
             │             │ 1 km  ──▶ 3 km  ──▶ 5 km   │
             │             └─────────────┬──────────────┘
             │                           │
             │             ┌─────────────┴──────────────┐
             │             │ Expanded Cohort ≥ 10?      │
             │            YES                          NO
             │             │                           │
             ▼             ▼                           ▼
┌──────────────────────────────────────┐   ┌───────────────────────────┐
│ 3. Aggregate Statistical Bounds Only │   │ 7. STRICT SUPPRESSION     │
│    (Median ATV, P25, P75 ranges)     │   │    "We don't have enough  │
└──────────────────┬───────────────────┘   │    local signal to provide│
                   │                       │    a reliable insight."   │
                   ▼                       └───────────────────────────┘
┌──────────────────────────────────────┐
│ 4. Anti-Reconstruction Sentinel      │
│    (Rate limit, Query Budget,        │
│     Sliding time/geo slice detector) │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│ 5. Noise Injection & Binning         │
│    (Differential privacy noise       │
│     preventing exact subtraction)    │
└──────────────────┬───────────────────┘
                   │
                   ▼
┌──────────────────────────────────────┐
│ 6. Action-Oriented Recommendations   │
│    (Bundles, inventory timing,       │
│     category growth — NOT matching)  │
└──────────────────────────────────────┘
```

---

## 3. Mathematical & Algorithmic Specifications

### 3.1 Adaptive Geographic Expansion
Given query location $L$ and base radius $r_0 = 1.0\text{ km}$:
$$\mathcal{M}(L, r) = \{ m \in \text{Merchants} \mid \text{dist}(L, \text{coord}(m)) \le r \}$$
1. If $|\mathcal{M}(L, 1.0)| \ge K_{threshold}$ (where $K_{threshold} = 10$), generate aggregate signal.
2. If $|\mathcal{M}(L, 1.0)| < K_{threshold}$, expand search to $r_1 = 3.0\text{ km}$.
3. If $|\mathcal{M}(L, 3.0)| < K_{threshold}$, expand to $r_2 = 5.0\text{ km}$.
4. If $|\mathcal{M}(L, 5.0)| < K_{threshold}$, emit **PRIVACY_SUPPRESSED** status code.

### 3.2 Safe Statistical Representation (No Point Estimates)
Never emit minimum, maximum, or individual points. Emit only robust non-identifying distribution bounds:
- **Median Average Transaction Value (ATV)**: $\tilde{X} = \text{Median}(X)$
- **Interquartile Range**: $P_{25} = Q_1, P_{75} = Q_3$
- **Directional Trend**: Category velocity indicator: $\Delta V = \frac{V_{t} - V_{t-7}}{V_{t-7}}$

### 3.3 Query Budget & Anti-Reconstruction Sentinel
To prevent **Differencing Attacks** where an adversary queries:
$$Q_1 = \text{Aggregate}(R \le 1.0\text{ km})$$
$$Q_2 = \text{Aggregate}(R \le 1.05\text{ km})$$
$$Q_2 - Q_1 = \text{Private Data of Store at } 1.02\text{ km}$$

Netrā enforces:
1. **Discrete Geographic Quantization**: All radius queries are snapped to discrete clusters (1km, 3km, 5km). Arbitrary sliding radii are forbidden.
2. **Merchant Query Budget**: A sliding window budget of at most 15 sensitive analytical queries per merchant per 24-hour cycle.
3. **Sliding-Window Similarity Detector**: If a merchant submits $\ge 3$ consecutive queries varying by $< 15\%$ in category or time boundaries, queries are flagged and throttled with security audit logging.

---

## 4. Competition Safety Guarantee
1. **Forbidden Output**: *"Gupta store is selling Maggi for ₹14. You should sell for ₹13."*
2. **Guaranteed Output**: *"Instant noodle category velocity is up 18% across South Delhi. Your transaction frequency is below category average. Recommended Action: Introduce a 4-pack evening combo bundle."*
