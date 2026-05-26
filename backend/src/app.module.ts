import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelemetryGateway } from './telemetry/telemetry.gateway';
import { RenodeUartService } from './renode/renode-uart.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, TelemetryGateway, RenodeUartService],
})
export class AppModule { }
