import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventEmitter } from 'events';
import { createConnection, Socket } from 'net';

export interface TelemetryFrame {
  id: string;
  lat: number;
  lon: number;
  alt: number;
  roc: number;
  speed: number;
  heading: number;
  t: number;
}

// Matches Zephyr UART log lines, e.g.:
// [00:01:35.042,907] <inf> zephyr_ble_app: Aircraft a1b2c3d4: lat=81486704 lon=989369728 alt=1118 m roc=10.0 m/s speed=346.0 kph heading=315.6 timestamp=95042 ms
const TELEMETRY_LINE_REGEX =
  /^(?:\[[\d:.,]+\]\s+<\w+>\s+\S+:\s+)?Aircraft\s+(?<id>\S+?):\s+lat=(?<lat>-?\d+)\s+lon=(?<lon>-?\d+)\s+alt=(?<alt>-?\d+)\s+m\s+roc=(?<roc>-?\d+(?:\.\d+)?)\s+m\/s\s+speed=(?<speed>-?\d+(?:\.\d+)?)\s+kph\s+heading=(?<heading>-?\d+(?:\.\d+)?)\s+timestamp=(?<t>-?\d+)\s+ms$/;

@Injectable()
export class RenodeUartService extends EventEmitter implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RenodeUartService.name);
  private socket: Socket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private buffer = '';
  private manuallyClosed = false;

  private readonly host = process.env.RENODE_UART_HOST ?? '127.0.0.1';
  private readonly port = Number(process.env.RENODE_UART_PORT ?? 4321);
  private readonly reconnectDelayMs = Number(process.env.RENODE_UART_RECONNECT_DELAY_MS ?? 2000);

  onModuleInit() {
    this.manuallyClosed = false;
    this.connect();
  }

  onModuleDestroy() {
    this.manuallyClosed = true;
    this.clearReconnectTimer();
    this.destroySocket();
  }

  private connect() {
    this.clearReconnectTimer();

    this.logger.log(`Connecting to Renode UART stream at ${this.host}:${this.port}`);

    const socket = createConnection({ host: this.host, port: this.port });
    socket.setEncoding('utf8');
    socket.on('connect', () => {
      this.logger.log('Connected to Renode UART stream');
      this.socket = socket;
      this.buffer = '';
      this.emit('renode:connected');
    });
    socket.on('data', (chunk: string) => this.handleData(chunk));
    socket.on('error', (error) => {
      this.logger.warn(`Renode UART socket error: ${error.message}`);
    });
    socket.on('close', () => {
      this.logger.warn('Renode UART stream closed');
      if (this.socket === socket) {
        this.socket = null;
        this.emit('renode:disconnected');
      }
      if (!this.manuallyClosed) {
        this.scheduleReconnect();
      }
    });
  }

  private handleData(chunk: string) {
    this.buffer += chunk;

    let newlineIndex = this.buffer.indexOf('\n');
    while (newlineIndex !== -1) {
      const rawLine = this.buffer.slice(0, newlineIndex).trim();
      this.buffer = this.buffer.slice(newlineIndex + 1);
      newlineIndex = this.buffer.indexOf('\n');

      if (!rawLine) {
        continue;
      }

      // Strip ANSI escape codes that Zephyr may embed in UART output
      const cleanLine = rawLine.replace(/\x1b\[[0-9;]*[mGKHFJABCDsu]/g, '');

      const telemetry = this.parseTelemetryLine(cleanLine);
      if (telemetry) {
        this.emit('telemetry', telemetry);
        continue;
      }

      if (cleanLine.includes('Aircraft')) {
        this.logger.warn(`Unparsed Aircraft line hex: ${Buffer.from(cleanLine).toString('hex').slice(0, 160)}`);
      }
      this.logger.debug(`Renode UART line: ${cleanLine}`);
    }
  }

  private parseTelemetryLine(line: string): TelemetryFrame | null {
    const match = TELEMETRY_LINE_REGEX.exec(line);
    if (!match?.groups) {
      return null;
    }

    return {
      id: match.groups.id.toUpperCase(),
      lat: Number(match.groups.lat) / 1e7,
      lon: Number(match.groups.lon) / 1e7,
      alt: Number(match.groups.alt),
      roc: Number(match.groups.roc),
      speed: Number(match.groups.speed),
      heading: Number(match.groups.heading),
      t: Number(match.groups.t),
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.manuallyClosed) {
        this.connect();
      }
    }, this.reconnectDelayMs);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private destroySocket() {
    if (!this.socket) {
      return;
    }

    this.socket.removeAllListeners();
    this.socket.destroy();
    this.socket = null;
  }
}
