#!/bin/bash

echo "🚀 Starting development environment..."

# Start backend in background
echo "📡 Starting backend server..."
cd /app/backend && python main.py &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in $(seq 1 30); do
    if curl -s -f http://localhost:5000/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend failed to start after 30 seconds"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    echo "   Attempt $i/30 - waiting..."
    sleep 1
done

# Start frontend
echo "🎨 Starting frontend server..."
cd /app/frontend && npm run dev -- --host 0.0.0.0 --port 3000 &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID