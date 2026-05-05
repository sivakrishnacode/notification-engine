// src/dispatcher/dispatcher.module.ts

import { Module } from '@nestjs/common';
import { DispatcherService } from './dispatcher.service';
import { ProvidersModule } from '../providers/providers.module';

@Module({
  imports: [ProvidersModule],
  providers: [DispatcherService],
  exports: [DispatcherService],
})
export class DispatcherModule {}
