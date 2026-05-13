import { z } from 'zod';
import { randomUUID } from 'crypto';

export const RequestServerEnum = z.enum(['GAMERZ_BANK', 'SPACE_SOLAR']);
export type RequestServer = z.infer<typeof RequestServerEnum>;

export const NotificationJobSchema = z.object({
  jobId: z.string().default(() => randomUUID()),
  Request_server: RequestServerEnum.default('GAMERZ_BANK'),
  provider: z.enum(['email', 'sms', 'push', 'whatsapp', 'in_app']),
  userId: z.string().min(1),
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
  priority: z.number().int().min(0).optional(),
  scheduledAt: z.string().datetime().optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
})
  .refine(
    (data) => {
      if (data.provider !== 'in_app' && !data.receptions) {
        return false;
      }
      return true;
    },
    { message: 'receptions is required for this provider', path: ['receptions'] },
  )
  .refine(
    (data) => {
      if (data.provider === 'whatsapp' && !data.templateId) {
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

export type NotificationJob = z.infer<typeof NotificationJobSchema>;
