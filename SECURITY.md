# NETRĀ Security Policy

## Core Security Invariants
1. **Network Intelligence Without Merchant Exposure**: No merchant can ever query or reconstruct another merchant's individual prices, sales, inventory, or footfall.
2. **Server-Side Identity Verification**: Client-submitted `merchant_id` headers or query parameters are ignored. Merchant identity is resolved strictly server-side from cryptographically signed JWT tokens.
3. **Small Cohort Suppression**: Any geographic cluster or category query containing fewer than 10 merchants is suppressed or expanded.
4. **Anti-Reconstruction Sentinel**: Sliding-window query budgets and diff detectors stop mathematical subtraction attacks.
5. **No Algorithmic Price Matching**: Netrā strictly refuses to provide competitor price points or advise price-fixing.
