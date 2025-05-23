import { IsMongoId, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWorkoutDto {
    @IsMongoId()
    projectId: string;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @Max(1000)
    weight: number;

    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(1000)
    reps: number;

    @IsString()
    @IsOptional()
    notes?: string;
} 