import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RenodeUartService, TelemetryFrame } from '../renode/renode-uart.service';

@WebSocketGateway({ namespace: 'telemetry', cors: { origin: '*' } })
export class TelemetryGateway
  implements OnModuleInit, OnModuleDestroy, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(TelemetryGateway.name);

  @WebSocketServer()
  server: Server;

  private latestTelemetry: TelemetryFrame | null = null;

  constructor(private readonly renodeUartService: RenodeUartService) { }

  onModuleInit() {
    this.renodeUartService.on('telemetry', this.handleTelemetry);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    if (this.latestTelemetry) {
      client.emit('telemetry', this.latestTelemetry);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  onModuleDestroy() {
    this.renodeUartService.off('telemetry', this.handleTelemetry);
  }

  private handleTelemetry = (frame: TelemetryFrame) => {
    this.latestTelemetry = frame;
    if (this.server) {
      this.server.emit('telemetry', frame);
    }
  };
}
