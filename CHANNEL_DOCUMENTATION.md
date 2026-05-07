# Notification Engine: Provider Documentation

This document outlines the supported communication providers, their required reception information, and sample payloads for enqueuing jobs.

## Supported Providers

| Provider | Description | Required Reception Field | Strategy Used |
| :--- | :--- | :--- | :--- |
| `email` | Standard email notifications | `email` | AWS SES |
| `sms` | Text messages to mobile devices | `phone` | AWS SNS |
| `push` | Mobile/Web push notifications | `deviceToken` | Firebase Cloud Messaging (FCM) |
| `whatsapp` | WhatsApp Business messages | `waId` | Meta/WhatsApp Business API |
| `in_app` | Real-time alerts inside your app | `userId` | WebSockets (Socket.io) + DB |

---

## 1. Email Payload
**Template Requirement**: Uses `subject`, `htmlBody`, and `body` (text).

```json
{
  "provider": "email",
  "userId": "user_123",
  "receptions": {
    "email": "customer@example.com"
  },
  "templateId": "welcome-email",
  "data": {
    "name": "John Doe",
    "loginUrl": "https://myapp.com/login"
  }
}
```

---

## 2. SMS Payload
**Template Requirement**: Uses `body`.

```json
{
  "provider": "sms",
  "userId": "user_123",
  "receptions": {
    "phone": "+919876543210"
  },
  "templateId": "otp-sms",
  "data": {
    "otp": "554422"
  }
}
```

---

## 3. Push Notification Payload (FCM)
**Template Requirement**: Uses `subject` (Title) and `body`.

```json
{
  "provider": "push",
  "userId": "user_123",
  "receptions": {
    "deviceToken": "fcm_registration_token_here"
  },
  "templateId": "order-shipped",
  "data": {
    "orderId": "ORD-101"
  }
}
```

---

## 4. WhatsApp Payload
**Template Requirement**: Uses `body` or template variables.

```json
{
  "provider": "whatsapp",
  "userId": "user_123",
  "receptions": {
    "waId": "+919876543210"
  },
  "templateId": "payment-success",
  "data": {
    "amount": "$50.00",
    "orderId": "ORD-101"
  }
}
```

---

## 5. In-App Notification Payload
**Template Requirement**: Uses `subject` and `body`. Delivered via WebSockets.

```json
{
  "provider": "in_app",
  "userId": "user_123",
  "receptions": {
     "userId": "user_123" 
  },
  "templateId": "system-alert",
  "data": {
    "message": "Maintenance starts in 10 minutes."
  }
}
```

---

## Multi-Channel "Fan-Out" Request
To send the same notification to multiple providers simultaneously, use the `NotificationsController` endpoint:

**Endpoint**: `POST /notifications/send`

```json
{
  "userId": "user_123",
  "providers": ["email", "push"],
  "templateId": "order-shipped",
  "data": {
    "orderId": "ORD-101"
  },
  "receptions": {
    "email": "customer@example.com",
    "deviceToken": "fcm_token_here"
  }
}
```

## Field Definitions

| Field | Type | Description |
| :--- | :--- | :--- |
| `jobId` | String (UUID) | Optional. Unique ID for the job. Auto-generated if missing. |
| `userId` | String | Unique identifier of the user (from your external server). |
| `provider` | Enum | One of: `email`, `sms`, `push`, `whatsapp`, `in_app`. |
| `templateId`| String | The ID of the pre-defined template to use. |
| `data` | Object | Key-value pairs used to replace `{{variables}}` in your templates. Also used for direct sending if `templateId` is missing (requires `body`). |
| `receptions` | Object | Contains contact info (`email`, `phone`, `deviceToken`, `waId`). |
| `priority` | Number | Optional. Higher numbers get processed first (BullMQ priority). |
| `meta` | Object | Optional. Any extra data you want to store with the delivery log. |

---

## Rate Limiting

Rate limits are applied globally per user and provider. You can configure these in your `.env` file:

- `RATE_LIMIT_EMAIL`: Max emails per hour.
- `RATE_LIMIT_SMS`: Max SMS per hour.
- `RATE_LIMIT_PUSH`: Max push notifications per hour.
- `RATE_LIMIT_WHATSAPP`: Max WhatsApp messages per hour.
- `RATE_LIMIT_IN_APP`: Max in-app alerts per hour.

If a limit is reached, the job status will be marked as `RATE_LIMITED` in the logs and the message will not be sent.

---

## Environment Setup

Ensure the following are configured for each provider:

- **Email (SES)**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `SES_FROM_ADDRESS`.
- **SMS (SNS)**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`.
- **Push (FCM)**: The `serviceAccountKey.json` file must be present in `src/providers/push/`.
- **WhatsApp**: `META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID`.
- **In-App**: Handled automatically via Socket.io.
