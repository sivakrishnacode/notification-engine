// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const templates = [
    // SMS Templates
    {
      id: 'sms-otp',
      name: 'OTP Verification',
      channel: 'sms',
      textBody: 'Your verification code is: {{otp}}. Do not share it with anyone.',
    },
    {
      id: 'sms-order-details',
      name: 'Order Details',
      channel: 'sms',
      textBody: 'Order #{{orderId}} of amount {{amount}} has been placed successfully. Track here: {{trackUrl}}',
    },

    // Push Notification Templates
    {
      id: 'push-amount-credit',
      name: 'Amount Credited',
      channel: 'push',
      subject: 'Wallet Updated',
      textBody: 'Amount {{amount}} has been credited to your wallet. New balance: {{balance}}',
    },
    {
      id: 'push-user-event',
      name: 'User Event Push',
      channel: 'push',
      subject: 'New Update',
      textBody: 'Hi {{name}}, something interesting happened: {{eventDescription}}',
    },

    // In-App Websocket Templates
    {
      id: 'in-app-user-event',
      name: 'User Event In-App',
      channel: 'in_app',
      subject: 'Activity Notification',
      textBody: 'You have a new activity: {{eventDetails}}',
    },

    // WhatsApp Templates
    {
      id: 'whatsapp-user-event',
      name: 'User Event WhatsApp',
      channel: 'whatsapp',
      textBody: 'Hi {{name}}, just a quick update on your recent activity: {{update}}',
    },

    // Email Templates
    {
      id: 'email-user-event',
      name: 'User Event Email',
      channel: 'email',
      subject: 'Notification: {{subject}}',
      textBody: 'Hi {{name}},\n\nThis is a notification regarding your recent activity: {{activity}}.\n\nBest regards,\nTeam',
      htmlBody: '<h1>Activity Update</h1><p>Hi <strong>{{name}}</strong>,</p><p>This is a notification regarding your recent activity: <em>{{activity}}</em>.</p><p>Best regards,<br>Team</p>',
    },
  ];

  console.log('Seeding templates...');

  for (const template of templates) {
    await prisma.template.upsert({
      where: { id: template.id },
      update: template,
      create: template,
    });
    console.log(`- Upserted template: ${template.id}`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
