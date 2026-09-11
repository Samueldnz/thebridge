import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateResearcherProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(14)
  cpf?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  academicTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  researchField?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  lattesUrl?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  orcidUrl?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  linkedinUrl?: string;
}