import { IsOptional, IsString, IsNumber, Min, Max, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryWorkoutDto {
    @IsOptional()
    @IsString()
    date?: string;

    @IsOptional()
    @IsString()
    project?: string;

    @IsOptional()
    @IsMongoId()
    userId?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    page: number = 1;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @Min(1)
    @Max(100)
    pageSize: number = 10;
}
