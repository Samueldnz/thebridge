import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { PatentStatus } from '../../generated/prisma/enums.js';

export class CreateProjectDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(10000)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  keywords?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  researchField?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  trl?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  crl?: number;

  @IsOptional()
  @IsEnum(PatentStatus)
  patentStatus?: PatentStatus;
}