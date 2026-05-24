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
- Zephyr project for firmware development

## Run the System

### Development mode

From the project root, start the local development containers with hot reload:

```bash
docker compose -f docker-compose.dev.yml up --build
```

This runs three services:

- `frontend` on `http://localhost:4200`
- `backend` on `http://localhost:3000`
- `renode` UART socket on `tcp://localhost:4321`

The development setup mounts local source code into the containers so frontend and backend changes reload automatically.

### Docker image mode

To build the production-ready image and run it locally:

```bash
docker build -t bluestern/simulated-aircraft-telemetry-system:latest .
```

```bash
docker run --init --sig-proxy=true --name simulated-aircraft-telemetry-system \
  -p 3000:3000 -p 4200:4200 -p 4321:4321 \
  bluestern/simulated-aircraft-telemetry-system:latest
```

This starts the full stack from the single Docker image.

### Access URLs

| Component          | URL                   |
| ------------------ | --------------------- |
| Frontend UI        | http://localhost:4200 |
| Backend API        | http://localhost:3000 |
| Renode UART Socket | tcp://localhost:4321  |

### Stop everything

```bash
docker compose -f docker-compose.dev.yml down
```

or, if you started the image directly:

```bash
docker rm -f simulated-aircraft-telemetry-system
```

## Notes

- In development mode, the backend expects Renode to be reachable at the Docker service name `renode`.
- The Renode script uses `$ORIGIN` so it automatically finds the firmware ELF.
- The frontend communicates with the backend via REST and WebSockets.

## Helpful Commands

### Run in the Background

```bash
docker run --name simulated-aircraft-telemetry-system -p 3000:3000 -p 4200:4200 -p 4321:4321 bluestern/simulated-aircraft-telemetry-system:latest
```

### Stop Everything

```bash
docker compose down
```

## Rebuilding

It's in the zephyr project. Need to build it and copypaste it here.

```
python3 -m venv ../zephyrproject/.venv
```

```
. ../zephyrproject/.venv/bin/activate
```

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

```
docker push bluestern/simulated-aircraft-telemetry-system:latest
```

## Development Notes

- The backend connects to Renode using the internal Docker hostname `renode:4321`.
- The Renode script uses `$ORIGIN` so it automatically finds the firmware ELF.
- The frontend communicates with the backend via REST and WebSockets.
