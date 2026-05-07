// src/templates/dto/update-template.dto.ts

import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateTemplateDto {
  @IsEnum(['email', 'sms', 'push', 'whatsapp', 'in_app'])
  @IsOptional()
  provider?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  htmlBody?: string;

  @IsString()
  @IsOptional()
  textBody?: string;
}
