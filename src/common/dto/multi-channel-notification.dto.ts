// src/common/dto/multi-channel-notification.dto.ts

import { z } from 'zod';

export const MultiChannelNotificationSchema = z.object({
  userId: z.string().min(1),
  providers: z.array(z.enum(['email', 'sms', 'push', 'whatsapp', 'in_app'])).min(1),
  templateId: z.string().optional(),
  data: z
    .object({
      subject: z.string().optional(),
      body: z.string().optional(),
      htmlBody: z.string().optional(),
    })
    .catchall(z.unknown())
    .optional()
    .default({}),
  receptions: z
    .object({
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
    })
    .optional()
    .refine(
      (r) =>
        !r ||
        r.email !== undefined ||
        r.phone !== undefined ||
        r.deviceToken !== undefined ||
        r.waId !== undefined,
      { message: 'At least one reception field must be provided' },
    ),
  priority: z.number().int().min(0).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
})
  .refine(
    (data) => {
      // If any provider is NOT in_app, receptions is required
      const needsReception = data.providers.some((c) => c !== 'in_app');
      if (needsReception && !data.receptions) {
        return false;
      }
      return true;
    },
    { message: 'receptions is required for these providers', path: ['receptions'] },
  )
  .refine(
    (data) => {
      if (data.providers.includes('whatsapp') && !data.templateId) {
        return false;
      }
      return true;
    },
    { message: 'templateId is required for WhatsApp', path: ['templateId'] },
  )
  .refine(
    (data) => {
      if (!data.templateId && !data.data?.body) {
        return false;
      }
      return true;
    },
    {
      message: 'Either templateId or data.body must be provided',
      path: ['templateId'],
    },
  );

export type MultiChannelNotification = z.infer<typeof MultiChannelNotificationSchema>;
