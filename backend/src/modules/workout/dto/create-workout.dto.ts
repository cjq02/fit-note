import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsOptional,
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

  /**
   * 重量单位
   * @type {string} 单位字符串，如'kg'或'lb'
   */
  @IsString()
    unit: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
    trainingTime?: number;

  /**
   * 备注
   * @type {string} 备注信息
   */
  @IsString()
  @IsOptional()
    remark?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutGroupDto)
    groups: WorkoutGroupDto[];
}
