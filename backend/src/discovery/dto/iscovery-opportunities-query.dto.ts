import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { PatentRequirement } from '../../generated/prisma/enums.js';

export class DiscoveryOpportunitiesQueryDto {
  @IsOptional()
  @IsUUID()
  competenceId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  industrySector?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  desiredTechnology?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  minTrl?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  maxTrl?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  minCrl?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  maxCrl?: number;

  @IsOptional()
  patentRequirement?: PatentRequirement;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}