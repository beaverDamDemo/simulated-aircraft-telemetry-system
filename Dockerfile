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

# Bootstrap package lists and add external repos (Node, .NET/Renode)
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget curl gnupg ca-certificates software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Add Node 24 repo
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash -

# Add Microsoft .NET repo (required by Renode)
RUN wget -q https://packages.microsoft.com/config/ubuntu/24.04/packages-microsoft-prod.deb -O /tmp/ms-prod.deb \
    && dpkg -i /tmp/ms-prod.deb \
    && rm /tmp/ms-prod.deb

# Install all runtime dependencies in one layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    nginx \
    postgresql \
    postgresql-client \
    python3 \
    python3-pip \
    mono-complete \
    dotnet-runtime-8.0 \
    screen \
    libgtk-3-0 \
    policykit-1 \
    libc6-dev \
    gcc \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Download and install Renode 1.16.1
# polkit-1-auth-agent is a virtual package (GUI-only); we run headless so force-skip it
RUN wget -q https://github.com/renode/renode/releases/download/v1.16.1/renode_1.16.1_amd64.deb -O /tmp/renode.deb \
    && dpkg --force-depends -i /tmp/renode.deb \
    && rm /tmp/renode.deb

# Create app directory and postgres log dir
WORKDIR /app
RUN mkdir -p /var/log/postgresql && chown postgres:postgres /var/log/postgresql

# Copy backend
COPY --from=backend-build /app/backend /app/backend

# Copy frontend build output
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Copy firmware + renode scripts
COPY firmware/ /app/firmware/

# Copy nginx config for single-image deployment
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose ports
EXPOSE 3000
EXPOSE 4200
EXPOSE 4321

# Start everything
CMD ["/app/start.sh"]
