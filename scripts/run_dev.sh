#!/bin/bash
set -e

echo "Starting NETRĀ Backend (FastAPI)..."
PYTHONPATH=. backend/venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "Starting NETRĀ Frontend (Vite)..."
npm --prefix frontend run dev -- --port 3000 &
FRONTEND_PID=$!

echo "NETRĀ running at http://localhost:3000 (API at http://localhost:8000)"
echo "Press Ctrl+C to terminate both servers."

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
