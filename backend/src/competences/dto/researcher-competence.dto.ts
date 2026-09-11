import {
  IsInt,
  Max,
  Min,
} from 'class-validator';

export class ResearcherCompetenceDto {
  @IsInt()
  @Min(1)
  @Max(5)
  level!: number;
}