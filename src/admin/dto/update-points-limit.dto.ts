import { IsInt, Min } from 'class-validator';

export class UpdatePointsLimitDto {
  @IsInt()
  @Min(0)
  pointsLimit: number;
}
