import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelemetryGateway } from './telemetry/telemetry.gateway';
import { RenodeUartService } from './renode/renode-uart.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, TelemetryGateway, RenodeUartService],
})
export class AppModule { }
