# Notification Engine

A production-ready NestJS Notification Engine powered by BullMQ, Redis, and PostgreSQL.

## Features

- **Multi-channel support**:
  - **Email**: AWS SES
  - **SMS**: AWS SNS
  - **Push**: AWS SNS (Mobile Push / GCM)
  - **WhatsApp**: Meta Cloud API
  - **In-App**: PostgreSQL persistence + real-time Socket.io emissions
- **BullMQ Integration**: Robust job processing with 5 retries, exponential backoff, and Dead Letter Queue (DLQ) support.
- **Rate Limiting**: Sliding-window rate limiting via Redis Lua scripts, configurable per channel.
- **Templating**: Handlebars-based rendering with subject and body support.
- **User Preferences**: Global opt-in/opt-out checks per user and channel.
- **Observability**: Structured logging with Pino and health monitoring with Terminus.
- **Strict Validation**: Zod-based job payload validation.

## Tech Stack

- **Framework**: NestJS 10
- **Queue**: BullMQ (Redis)
- **ORM**: Prisma (PostgreSQL)
- **AWS SDK**: v3 (@aws-sdk/client-ses, @aws-sdk/client-sns)
- **Real-time**: Socket.io
- **Logging**: Pino

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- AWS Credentials (for SES/SNS)
- Meta Access Token (for WhatsApp)

### Installation

1. Clone the repository.
2. Copy `.env.example` to `.env` and fill in the required credentials.
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

1. Start infrastructure (Redis & PostgreSQL):
   ```bash
   docker-compose up -d redis postgres
   ```
2. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
3. Start the application:
   ```bash
   npm run start:dev
   ```

### Running with Docker

```bash
docker-compose up --build
```

## Job Payload Format

Jobs should be pushed to the `notifications` queue with the following JSON structure:

```json
{
  "jobId": "uuid-v4",
  "channel": "email",
  "userId": "user-123",
  "recipient": {
    "email": "user@example.com",
    "phone": "+1234567890",
    "deviceToken": "arn:aws:sns:...",
    "waId": "+1234567890"
  },
  "templateId": "template-uuid",
  "data": {
    "firstName": "John",
    "orderId": "ORD-456"
  },
  "priority": 1,
  "scheduledAt": "2024-05-20T10:00:00Z"
}
```

## License

MIT
