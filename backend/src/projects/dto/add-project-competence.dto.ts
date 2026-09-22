import {
  IsInt,
  Max,
  Min,
} from 'class-validator';

export class AddProjectCompetenceDto {
  @IsInt()
  @Min(1)
  @Max(5)
  level!: number;
}