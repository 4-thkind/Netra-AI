#!/bin/bash
set -e

echo "========================================================"
echo "  NETRĀ ('नेत्र') — AI Growth Copilot for Kirana Stores"
echo "  Paytm Hackathon 2026 • Demo Launcher"
echo "========================================================"

# 1. Environment Verification
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -d "backend/venv" ]; then
    echo "⚙️ Creating Python virtual environment..."
    python3 -m venv backend/venv
    source backend/venv/bin/activate
    pip install -r backend/requirements.txt greenlet
else
    source backend/venv/bin/activate
fi

# 2. Database Verification
if [ ! -f "netra.db" ]; then
    echo "📊 Initializing and seeding Kaggle retail dataset..."
    PYTHONPATH=. python3 backend/app/scripts/import_kaggle_data.py
fi

# 3. Launch Backend
echo "🚀 Starting NETRĀ Backend (FastAPI on http://127.0.0.1:8000)..."
PYTHONPATH=. backend/venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# 4. Launch Frontend
echo "🎨 Starting NETRĀ Frontend (Vite on http://127.0.0.1:3000)..."
npm --prefix frontend run dev -- --host 127.0.0.1 --port 3000 &
FRONTEND_PID=$!

sleep 2

echo ""
echo "========================================================"
echo "  ✅ NETRĀ IS LIVE!"
echo "  🖥️  Web UI:    http://localhost:3000"
echo "  📖 API Docs:  http://localhost:8000/docs"
echo "  🛡️  Principle: Network Intelligence Without Merchant Exposure"
echo "========================================================"
echo "Press Ctrl+C to terminate both servers cleanly."

# Open browser if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    open http://localhost:3000 || true
fi

trap "echo 'Stopping NETRĀ servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
