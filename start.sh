#!/bin/bash

echo "Starting Renode..."
renode --disable-xwt --console /app/firmware/renode-websocket.resc &
RENODE_PID=$!

echo "Starting Backend..."
node /app/backend/dist/main.js &
BACKEND_PID=$!

echo "Starting Frontend..."
npx serve -s /app/frontend/dist -l 4200 &
FRONTEND_PID=$!

# Wait for all processes
wait -n $RENODE_PID $BACKEND_PID $FRONTEND_PID
