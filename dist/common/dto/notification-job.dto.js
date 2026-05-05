"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationJobSchema = void 0;
const zod_1 = require("zod");
const crypto_1 = require("crypto");
exports.NotificationJobSchema = zod_1.z.object({
    jobId: zod_1.z.string().default(() => (0, crypto_1.randomUUID)()),
    channel: zod_1.z.enum(['email', 'sms', 'push', 'whatsapp', 'in_app']),
    userId: zod_1.z.string().min(1),
    recipient: zod_1.z
        .object({
        email: zod_1.z.string().email().optional(),
        phone: zod_1.z
            .string()
            .regex(/^\+[1-9]\d{1,14}$/, 'Must be E.164 format')
            .optional(),
        deviceToken: zod_1.z.string().optional(),
        waId: zod_1.z
            .string()
            .regex(/^\+[1-9]\d{1,14}$/, 'Must be E.164 format')
            .optional(),
    })
        .refine((r) => r.email !== undefined ||
        r.phone !== undefined ||
        r.deviceToken !== undefined ||
        r.waId !== undefined, { message: 'At least one recipient field must be provided' }),
    templateId: zod_1.z.string().optional(),
    content: zod_1.z
        .object({
        subject: zod_1.z.string().optional(),
        body: zod_1.z.string().optional(),
        htmlBody: zod_1.z.string().optional(),
    })
        .optional(),
    data: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional().default({}),
    priority: zod_1.z.number().int().min(0).optional(),
    scheduledAt: zod_1.z.string().datetime().optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).optional(),
})
    .refine((data) => {
    if (data.channel === 'whatsapp' && !data.templateId) {
        return false;
    }
    return true;
}, { message: 'templateId is required for WhatsApp', path: ['templateId'] })
    .refine((data) => {
    if (!data.templateId && !data.content?.body) {
        return false;
    }
    return true;
}, {
    message: 'Either templateId or content.body must be provided',
    path: ['templateId'],
});
//# sourceMappingURL=notification-job.dto.js.map