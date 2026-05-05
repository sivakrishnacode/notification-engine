// src/providers/providers.module.ts

import { Module } from '@nestjs/common';
import { EmailProvider } from './email/email.provider';
import { SmsProvider } from './sms/sms.provider';
import { PushProvider } from './push/push.provider';
import { WhatsappProvider } from './whatsapp/whatsapp.provider';
import { InAppProvider } from './in-app/in-app.provider';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [WebsocketModule],
  providers: [
    EmailProvider,
    SmsProvider,
    PushProvider,
    WhatsappProvider,
    InAppProvider,
  ],
  exports: [
    EmailProvider,
    SmsProvider,
    PushProvider,
    WhatsappProvider,
    InAppProvider,
  ],
})
export class ProvidersModule {}
