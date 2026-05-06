// src/providers/providers.module.ts

import { Module } from '@nestjs/common';
import { EmailProvider } from './email/email.provider';
import { SmsProvider } from './sms/sms.provider';
import { PushProvider } from './push/push.provider';
import { MetaWhatsappProvider } from './whatsapp/meta-whatsapp.provider';
import { ConcepsWhatsappProvider } from './whatsapp/conceps-whatsapp.provider';
import { InAppProvider } from './in-app/in-app.provider';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [WebsocketModule],
  providers: [
    EmailProvider,
    SmsProvider,
    PushProvider,
    MetaWhatsappProvider,
    ConcepsWhatsappProvider,
    InAppProvider,
  ],
  exports: [
    EmailProvider,
    SmsProvider,
    PushProvider,
    MetaWhatsappProvider,
    ConcepsWhatsappProvider,
    InAppProvider,
  ],
})
export class ProvidersModule {}
