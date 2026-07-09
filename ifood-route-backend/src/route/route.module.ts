import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { OrdersModule } from '../orders/orders.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [HttpModule, OrdersModule, SettingsModule],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}
