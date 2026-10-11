
#!/bin/bash

# Stop if a command fails
set -e

# Navigate to project root
cd "$(dirname "$0")"

echo "Starting Steam Player Analytics..."

# Start PostgreSQL
docker compose up -d

# Start ingestion service
(cd services/ingestion && npm start) &
INGESTION_PID=$!

# Start API
(cd services/api && npm start) &
API_PID=$!

# Start React frontend
(cd frontend && npm run dev -- --host 127.0.0.1) &
FRONTEND_PID=$!

# Stop background processes when script exits
cleanup() {
    echo "Stopping application..."
    kill "$INGESTION_PID" "$API_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo ""
echo "Steam Player Analytics is starting!"
echo "Dashboard: http://localhost:5173"
echo "API:       http://localhost:3000"
echo "Press Ctrl+C to stop the application."

wait
