# ============================
# 1) Build FRONTEND (Vue)
# ============================
FROM node:24 AS frontend-build
WORKDIR /app/frontend
COPY frontend/ .
RUN npm install
RUN npm run build

# ============================
# 2) Build BACKEND (NestJS)
# ============================
FROM node:24 AS backend-build
WORKDIR /app/backend
COPY backend/ .
RUN npm install
RUN npm run build

# ============================
# 3) Final runtime image
# ============================
FROM ubuntu:24.04

# Install dependencies for Renode + Node
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    software-properties-common \
    python3 \
    mono-complete \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Node 24 (official)
RUN wget -qO- https://deb.nodesource.com/setup_24.x | bash - \
    && apt-get install -y nodejs

# Install Renode 1.16.1 from GitHub releases
RUN wget -q https://github.com/renode/renode/releases/download/v1.16.1/renode_1.16.1_amd64.deb -O /tmp/renode.deb && \
    apt-get update && apt-get install -y mono-complete python3 unzip && \
    dpkg -i /tmp/renode.deb || apt-get -f install -y

# Create app directory
WORKDIR /app

# Copy backend
COPY --from=backend-build /app/backend /app/backend

# Copy frontend build output
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Copy firmware + renode scripts
COPY firmware/ /app/firmware/

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose ports
EXPOSE 3000
EXPOSE 4200
EXPOSE 4321

# Start everything
CMD ["/app/start.sh"]
