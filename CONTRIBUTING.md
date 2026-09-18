# Contributing to NETRĀ ("नेत्र")

Thank you for your interest in contributing to **NETRĀ**, the privacy-preserving AI Growth Copilot for Indian Kirana stores.

---

## 🛡️ The Core Invariant

All contributions must strictly respect Netrā's primary architectural invariant:
> *"Network intelligence without merchant exposure."*

No code path, API response, or LLM prompt template may ever:
- Expose competitor store names or individual store pricing.
- Bypass small-cohort suppression ($N < 10$).
- Disable differential privacy noise on market aggregations.
- Bypass the 15 queries/24-hour reconstruction defense budget.

---

## 🛠️ Development Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- SQLite 3

### 2. Backend Setup
```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt greenlet
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --port 3000
```

### 4. Running Tests
All contributions must pass the automated test suite without warnings:
```bash
PYTHONPATH=. ./backend/venv/bin/pytest backend/tests/ -v
npm --prefix frontend run build
```

---

## 📋 Pull Request Process

1. Fork the repo and create your feature branch: `git checkout -b feature/my-enhancement`.
2. Ensure existing tests pass and add new unit tests for any new endpoints or safety guards.
3. Commit using clear, descriptive messages following conventional commits (`feat:`, `fix:`, `docs:`, `test:`).
4. Submit a Pull Request targeting the `main` branch with a walkthrough of changes and test evidence.
