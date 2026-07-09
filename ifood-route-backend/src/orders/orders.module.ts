import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { IfoodAuthModule } from '../ifood-auth/ifood-auth.module';
import { OrderEntity } from './order.entity';

@Module({
  imports: [HttpModule, IfoodAuthModule, TypeOrmModule.forFeature([OrderEntity])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
