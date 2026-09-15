import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { AffiliationRole } from '../../generated/prisma/enums.js';

export class CreateResearcherAffiliationDto {
  @IsUUID()
  organizationId!: string;

  @IsEnum(AffiliationRole)
  role!: AffiliationRole;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  endedAt?: string;
}