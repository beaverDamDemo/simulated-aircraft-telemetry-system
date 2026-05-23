#!/bin/bash

echo "Starting Renode simulation..."
(tail -f /dev/null | renode --disable-xwt --console /app/firmware/renode-websocket.resc) &
RENODE_PID=$!

echo "Waiting for Renode UART socket on port 4321..."
until bash -c 'echo > /dev/tcp/localhost/4321' 2>/dev/null; do
  sleep 1
done
echo "Renode ready."

echo "Starting Backend..."
node /app/backend/dist/main.js &
BACKEND_PID=$!

echo "Starting Frontend (nginx)..."
nginx -g "daemon off;" &
FRONTEND_PID=$!

wait -n $RENODE_PID $BACKEND_PID $FRONTEND_PID
