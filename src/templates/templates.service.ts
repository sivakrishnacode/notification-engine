// src/templates/templates.service.ts

import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Handlebars from 'handlebars';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';

export interface RenderedTemplate {
  subject?: string;
  body: string;
  htmlBody?: string;
}

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTemplateDto) {
    const { provider, ...rest } = dto;
    return this.prisma.template.create({
      data: {
        ...rest,
        channel: provider,
      },
    });
  }

  async findAll() {
    return this.prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.template.findUnique({
      where: { id },
    });
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    return template;
  }

  async update(id: string, dto: UpdateTemplateDto) {
    // Check if exists first
    await this.findOne(id);
    const { provider, ...rest } = dto;
    return this.prisma.template.update({
      where: { id },
      data: {
        ...rest,
        ...(provider ? { channel: provider } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.template.delete({
      where: { id },
    });
  }

  async render(
    templateId: string,
    provider: string,
    data: Record<string, unknown>,
  ): Promise<RenderedTemplate> {
    const template = await this.prisma.template.findFirst({
      where: { id: templateId, channel: provider },
    });

    if (!template) {
      throw new NotFoundException(
        `Template not found: id="${templateId}" provider="${provider}"`,
      );
    }

    this.logger.debug(
      { templateId, provider },
      'Rendering template',
    );

    const renderString = (src: string): string => {
      const compiled = Handlebars.compile(src);
      return compiled(data);
    };

    const result: RenderedTemplate = {
      body: renderString(template.textBody),
    };

    if (template.subject) {
      result.subject = renderString(template.subject);
    }

    if (template.htmlBody) {
      result.htmlBody = renderString(template.htmlBody);
    }

    return result;
  }
}
