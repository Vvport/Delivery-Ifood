import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IfoodAuthModule } from './ifood-auth/ifood-auth.module';
import { OrdersModule } from './orders/orders.module';
import { IfoodPollingModule } from './ifood-polling/ifood-polling.module';
import { RouteModule } from './route/route.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),

    SettingsModule,
    IfoodAuthModule,
    OrdersModule,
    IfoodPollingModule,
    RouteModule,
  ],
})
export class AppModule {}
