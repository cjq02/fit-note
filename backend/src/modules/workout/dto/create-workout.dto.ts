import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

// 训练组 DTO
export class WorkoutGroupDto {
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(1000)
    reps: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(1000)
    weight: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
    seqNo: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
    restTime?: number;
}

export class CreateWorkoutDto {
    @IsString()
      date: string;

  @IsString()
    projectName: string;

  @IsMongoId()
    projectId: string;

  @IsEnum(['kg', 'lb'])
    unit: 'kg' | 'lb';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutGroupDto)
    groups: WorkoutGroupDto[];
}
