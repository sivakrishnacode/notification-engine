// src/common/dto/multi-channel-notification.dto.ts

import { z } from 'zod';

export const MultiChannelNotificationSchema = z.object({
  userId: z.string().min(1),
  channels: z.array(z.enum(['email', 'sms', 'push', 'whatsapp', 'in_app'])).min(1),
  templateId: z.string().optional(),
  content: z
    .object({
      subject: z.string().optional(),
      body: z.string().optional(),
      htmlBody: z.string().optional(),
    })
    .optional(),
  data: z.record(z.string(), z.unknown()).optional().default({}),
  recipient: z.object({
    email: z.string().email().optional(),
    phone: z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/, 'Must be E.164 format')
      .optional(),
    deviceToken: z.string().optional(),
    waId: z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/, 'Must be E.164 format')
      .optional(),
  }),
  priority: z.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})
  .refine(
    (data) => {
      if (data.channels.includes('whatsapp') && !data.templateId) {
        return false;
      }
      return true;
    },
    { message: 'templateId is required for WhatsApp', path: ['templateId'] },
  )
  .refine(
    (data) => {
      if (!data.templateId && !data.content?.body) {
        return false;
      }
      return true;
    },
    {
      message: 'Either templateId or content.body must be provided',
      path: ['templateId'],
    },
  );

export type MultiChannelNotification = z.infer<typeof MultiChannelNotificationSchema>;
