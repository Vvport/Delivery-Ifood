import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IfoodAuthService } from './ifood-auth.service';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [HttpModule, SettingsModule],
  providers: [IfoodAuthService],
  exports: [IfoodAuthService],
})
export class IfoodAuthModule {}
