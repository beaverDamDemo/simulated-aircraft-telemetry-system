#!/bin/bash

# ------------------------------------
# PostgreSQL (bundled, single-image)
# ------------------------------------
PGDATA=/var/lib/postgresql/data
PGUSER=sats
PGDB=sats
PGPASSWORD="${POSTGRES_PASSWORD:-sats}"
PGBIN=/usr/lib/postgresql/16/bin

# Ensure the postgres system user owns the data dir
mkdir -p "$PGDATA"
chown -R postgres:postgres "$PGDATA"

# Initialise cluster only on first boot
if [ ! -f "$PGDATA/PG_VERSION" ]; then
  echo "Initialising PostgreSQL cluster..."
  PWFILE=$(mktemp)
  echo "$PGPASSWORD" > "$PWFILE"
  chown postgres:postgres "$PWFILE"
  su -c "$PGBIN/initdb -D '$PGDATA' --username='$PGUSER' --pwfile='$PWFILE'" postgres
  rm -f "$PWFILE"
fi

echo "Starting PostgreSQL..."
su -c "$PGBIN/pg_ctl -D '$PGDATA' -l /var/log/postgresql/postgresql.log start" postgres

# Wait until accepting connections
until su -c "$PGBIN/pg_isready -U '$PGUSER' -d postgres" postgres 2>/dev/null; do
  sleep 1
done

# Create the database if it doesn't exist yet
su -c "$PGBIN/psql -U '$PGUSER' -d postgres -tc \"SELECT 1 FROM pg_database WHERE datname='$PGDB'\" | grep -q 1 || $PGBIN/createdb -U '$PGUSER' '$PGDB'" postgres

export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@localhost:5432/${PGDB}"
export JWT_SECRET="${JWT_SECRET:-change-me-in-production}"

echo "Starting Renode simulation..."
(tail -f /dev/null | renode --disable-xwt --console /app/firmware/renode-websocket.resc) &
RENODE_PID=$!

echo "Waiting for Renode UART socket on port 4321..."
until bash -c 'echo > /dev/tcp/localhost/4321' 2>/dev/null; do
  sleep 1
done
echo "Renode ready."

echo "Starting Backend..."
cd /app/backend && npx prisma migrate deploy 2>&1
node /app/backend/dist/main.js &
BACKEND_PID=$!

echo "Starting Frontend (nginx)..."
nginx -g "daemon off;" &
FRONTEND_PID=$!

wait -n $RENODE_PID $BACKEND_PID $FRONTEND_PID
