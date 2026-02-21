import { IsNumber, IsString, IsNotEmpty, Min, IsIn } from 'class-validator';

export class GrantTrialDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  duration: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['days', 'weeks', 'months'])
  unit: 'days' | 'weeks' | 'months';

  @IsString()
  @IsNotEmpty()
  planType: string;
}
