// src/templates/dto/create-template.dto.ts

import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateTemplateDto {
  @IsEnum(['email', 'sms', 'push', 'whatsapp', 'in_app'])
  @IsNotEmpty()
  channel!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  htmlBody?: string;

  @IsString()
  @IsNotEmpty()
  textBody!: string;
}
