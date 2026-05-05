// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const templates = [
    {
      id: 'welcome-email',
      name: 'Welcome Email',
      channel: 'email',
      subject: 'Welcome to our platform, {{name}}!',
      textBody: 'Hi {{name}}, we are glad to have you on board.',
      htmlBody: '<h1>Welcome!</h1><p>Hi <strong>{{name}}</strong>, we are glad to have you on board.</p>',
    },
    {
      id: 'otp-sms',
      name: 'OTP SMS',
      channel: 'sms',
      textBody: 'Your verification code is: {{otp}}. It will expire in 5 minutes.',
    },
    {
      id: 'order-push',
      name: 'Order Shipped Push',
      channel: 'push',
      subject: 'Order Shipped!',
      textBody: 'Great news! Your order #{{orderId}} has been shipped and is on its way.',
    },
    {
      id: 'payment-whatsapp',
      name: 'Payment Success WhatsApp',
      channel: 'whatsapp',
      textBody: 'Hi {{name}}, your payment of {{amount}} for order #{{orderId}} was successful. Thank you!',
    },
    {
      id: 'system-alert-in-app',
      name: 'System Alert In-App',
      channel: 'in_app',
      subject: 'System Maintenance',
      textBody: 'The system will undergo maintenance at {{time}}. Please save your work.',
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
