import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { AffiliationRole } from '../../generated/prisma/enums.js';

export class UpdateResearcherAffiliationDto {
  @IsOptional()
  @IsEnum(AffiliationRole)
  role?: AffiliationRole;

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