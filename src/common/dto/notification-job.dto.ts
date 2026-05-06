// src/common/dto/notification-job.dto.ts

import { z } from 'zod';
import { randomUUID } from 'crypto';

export const NotificationJobSchema = z.object({
  jobId: z.string().default(() => randomUUID()),
  channel: z.enum(['email', 'sms', 'push', 'whatsapp', 'in_app']),
  userId: z.string().min(1),
  recipient: z
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
    .refine(
      (r) =>
        r.email !== undefined ||
        r.phone !== undefined ||
        r.deviceToken !== undefined ||
        r.waId !== undefined,
      { message: 'At least one recipient field must be provided' },
    ),
  templateId: z.string().optional(),
  content: z
    .object({
      subject: z.string().optional(),
      body: z.string().optional(),
      htmlBody: z.string().optional(),
    })
    .optional(),
  data: z.record(z.string(), z.unknown()).optional().default({}),
  priority: z.number().int().min(0).optional(),
  scheduledAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  provider: z.string().optional(),
})
  .refine(
    (data) => {
      if (data.channel === 'whatsapp' && !data.templateId) {
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

export type NotificationJob = z.infer<typeof NotificationJobSchema>;
