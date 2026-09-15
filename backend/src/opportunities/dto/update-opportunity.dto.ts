import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  OpportunityStatus,
  PatentRequirement,
} from '../../generated/prisma/enums.js';

export class UpdateOpportunityDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  keywords?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  industrySector?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  desiredTechnology?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(9)
  minTrl?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(9)
  desiredCrl?: number;

  @IsOptional()
  @IsEnum(PatentRequirement)
  patentRequirement?: PatentRequirement;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetMax?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  timeline?: string;

  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;
}