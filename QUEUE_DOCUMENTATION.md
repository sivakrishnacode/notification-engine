# Notification Queue Documentation

This document explains how to add data to the notification engine queue for processing. The engine supports multiple server configurations (GAMERZ_BANK and SPACE_SOLAR) and various providers (Email, SMS, Push, WhatsApp, In-App).

## 1. Request Server Selection

The system uses the `Request_server` field to determine which set of credentials (Firebase, AWS, Meta/Conceps) to use.

- **GAMERZ_BANK** (Default): Uses `GAMERZ_BANK_*` environment variables.
- **SPACE_SOLAR**: Uses `SPACE_SOLAR_*` environment variables.

---

## 2. API Usage (`POST /notifications/send`)

To send a notification to multiple channels at once, use the `/notifications/send` endpoint. This is the recommended way for external applications to interact with the engine.

### Endpoint
`POST /notifications/send`

### Headers
- `Authorization`: `Bearer <JWT_TOKEN>`
- `Content-Type`: `application/json`

### Payload Structure (`MultiChannelNotification`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `Request_server` | `string` | `GAMERZ_BANK` or `SPACE_SOLAR`. Defaults to `GAMERZ_BANK`. |
| `userId` | `string` | Unique identifier for the recipient user. |
| `providers` | `string[]` | Array of channels: `email`, `sms`, `push`, `whatsapp`, `in_app`. |
| `templateId` | `string` | (Optional) ID of the template to use. Required for WhatsApp. |
| `data` | `object` | (Optional) Key-value pairs for template placeholders. |
| `receptions` | `object` | (Required if not `in_app`) Contact details. |
| `priority` | `number` | (Optional) Queue priority (higher numbers processed first). |

### Example Payload (GAMERZ_BANK)

```json
{
  "Request_server": "GAMERZ_BANK",
  "userId": "user_123",
  "providers": ["push", "email"],
  "receptions": {
    "deviceToken": "fcm_token_xyz",
    "email": "user@example.com"
  },
  "data": {
    "subject": "Welcome!",
    "body": "Hello Gamer, welcome to GAMERZ_BANK!"
  }
}
```

---

## 3. Internal Queue Usage (`QueueService`)

If you are working within the NestJS codebase, you can use the `QueueService` to add jobs directly.

### `NotificationJob` Schema

```typescript
import { QueueService } from './queue/queue.service';

// Inside a service...
constructor(private readonly queueService: QueueService) {}

async notifyUser() {
  await this.queueService.enqueue({
    Request_server: 'SPACE_SOLAR', // Selection of server config
    provider: 'sms',
    userId: 'user_456',
    receptions: {
      phone: '+919876543210'
    },
    data: {
      body: 'Your Space Solar OTP is 123456'
    }
  });
}
```

---

## 4. Provider Specific Requirements

### WhatsApp (Conceps/Meta)
- **Required**: `templateId` must be provided.
- **Required**: `receptions.waId` must be provided (phone number with country code).
- **Meta**: Requires `META_PHONE_NUMBER_ID` and `META_ACCESS_TOKEN`.
- **Conceps**: Requires `CONCEPS_TOKEN`.

### Push (Firebase)
- **Required**: `receptions.deviceToken`.
- **Note**: The system initializes separate Firebase Admin Apps for each server.

### Email (SES)
- **Required**: `receptions.email`.
- **Required**: `data.subject`.

### SMS (SNS)
- **Required**: `receptions.phone`.

---

## 5. Environment Configuration

Ensure your `.env` file has the correct prefixes for each server:

```env
# GAMERZ_BANK Credentials
GAMERZ_BANK_FIREBASE_PROJECT_ID=...
GAMERZ_BANK_AWS_ACCESS_KEY_ID=...

# SPACE_SOLAR Credentials
SPACE_SOLAR_FIREBASE_PROJECT_ID=...
SPACE_SOLAR_AWS_ACCESS_KEY_ID=...
```
