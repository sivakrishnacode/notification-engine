// src/app.controller.ts

import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      name: 'Notification Engine API',
      version: '1.0.0',
      status: 'Running',
      endpoints: [
        { path: '/', description: 'This info' },
        { path: '/health', description: 'System health status' },
        { path: '/templates', description: 'Template CRUD (JWT Protected)' },
        { path: '/admin/queues', description: 'BullBoard dashboard' },
      ],
    };
  }
}
