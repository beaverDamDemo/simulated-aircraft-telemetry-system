# ============================
# 1) Build FRONTEND (Vue)
# ============================
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/ .
RUN npm install
RUN npm run build

# ============================
# 2) Build BACKEND (NestJS)
# ============================
FROM node:20 AS backend-build
WORKDIR /app/backend
COPY backend/ .
RUN npm install
RUN npm run build

# ============================
# 3) Final runtime image
# ============================
FROM ubuntu:22.04

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    nodejs npm python3 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY --from=backend-build /app/backend /app/backend

# Copy frontend build output
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Copy firmware + renode scripts
COPY firmware/ /app/firmware/

# Expose ports
EXPOSE 3000
EXPOSE 4200

# Start both backend + frontend
CMD node /app/backend/dist/main.js & \
    npx serve -s /app/frontend/dist -l 4200 && \
    wait
