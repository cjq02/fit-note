import { IsString, IsOptional, Length } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    @Length(1, 50)
    name: string;

    @IsString()
    @IsOptional()
    @Length(0, 200)
    description?: string;
} 