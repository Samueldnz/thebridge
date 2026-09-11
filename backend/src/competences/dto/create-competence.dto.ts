import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCompetenceDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(255)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}