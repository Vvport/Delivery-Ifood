import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IfoodPollingService } from './ifood-polling.service';
import { IfoodAuthModule } from '../ifood-auth/ifood-auth.module';
import { OrdersModule } from '../orders/orders.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [HttpModule, IfoodAuthModule, OrdersModule, SettingsModule],
  providers: [IfoodPollingService],
})
export class IfoodPollingModule {}
