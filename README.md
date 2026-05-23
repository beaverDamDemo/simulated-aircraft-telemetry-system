# Simulated Aircraft Telemetry System

A fully containerized end-to-end simulation environment for aircraft telemetry.
The project combines Zephyr firmware, Renode hardware simulation, a NestJS backend, and a Vue frontend so the full stack runs with a single Docker command.

## Overview

This system simulates a complete aircraft telemetry pipeline:

- Firmware runs inside Renode and emits telemetry over a virtual UART interface.
- Renode emulates an nRF52840 microcontroller, loads the compiled firmware, and exposes the UART stream over TCP.
- The backend connects to Renode’s UART socket, parses telemetry packets, and exposes them through REST and WebSocket APIs.
- The frontend displays real-time telemetry on an interactive dashboard.

Everything is containerized, so you do not need to install the Zephyr SDK, Renode, or Node.js locally.

## Project Structure

```text
simulated-aircraft-telemetry-system/
├── backend/          NestJS API + WebSocket server
├── frontend/         Vue web dashboard
├── firmware/         Zephyr firmware + Renode script
│   ├── build/        Compiled firmware artifacts
│   └── renode-websocket.resc
└── tools/
    └── renode/       Renode Docker image
```

## Requirements

- Docker
- Docker Compose

## Run the System

From the root of the project, start everything with:

```bash
docker compose up --build
```

This starts:

- Renode, which runs the firmware simulation
- Backend, which serves the API and WebSocket stream
- Frontend, which serves the dashboard

### If using Docker Desktop

You may have to add these ports mappings in the options:
4200, 3000, 4321

## Access URLs

| Component          | URL                   |
| ------------------ | --------------------- |
| Frontend UI        | http://localhost:4200 |
| Backend API        | http://localhost:3000 |
| Renode UART Socket | tcp://localhost:4321  |

## Notes

- The backend expects Renode to be reachable at the service name renode inside the Docker network.
- The frontend is published on port 4200, while the container serves the app on port 80.

## Helpful Commands

### Run in the Background

```bash
docker run --name simulated-aircraft-telemetry-system -p 3000:3000 -p 4200:4200 -p 4321:4321 bluestern/simulated-aircraft-telemetry-system:latest

```

### Stop Everything

```bash
docker compose down
```

## Rebuilding Firmware

Currently it's in the old project. Need to go

```
( cd ~/programming/zephyrproject/zephyr_ble_app && west build -b nrf52840dk/nrf52840 -p always )
```

```
cp ~/programming/zephyrproject/zephyr_ble_app/build/zephyr/zephyr.elf ~/programming/simulated-aircraft-telemetry-system/firmware/
```

```
docker rm -f simulated-aircraft-telemetry-system
```

```
docker rmi -f bluestern/simulated-aircraft-telemetry-system:latest
```

⚠️ pick one of the following two, no cache is optional

```
docker build -t bluestern/simulated-aircraft-telemetry-system:latest .
```

```
docker build --no-cache -t bluestern/simulated-aircraft-telemetry-system:latest .
```

```
docker run --init --sig-proxy=true --name simulated-aircraft-telemetry-system \
  -p 3000:3000 -p 4200:4200 -p 4321:4321 \
  bluestern/simulated-aircraft-telemetry-system:latest
```

## Development Notes

- The backend connects to Renode using the internal Docker hostname `renode:4321`.
- The Renode script uses `$ORIGIN` so it automatically finds the firmware ELF.
- The frontend communicates with the backend via REST and WebSockets.
