import {
  IsInt,
  Max,
  Min,
} from 'class-validator';

export class UpdateOpportunityCompetenceDto {
  @IsInt()
  @Min(1)
  @Max(5)
  weight!: number;
}