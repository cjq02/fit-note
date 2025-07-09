import { IsString, IsOptional, Length, IsNumber, Min, IsArray, ArrayUnique } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    @Length(1, 50)
      name: string;

    @IsString()
    @IsOptional()
    @Length(0, 200)
      description?: string;

    @IsNumber()
    @Min(0)
      seqNo: number;

    @IsString()
      category: string;

    @IsString()
      defaultUnit: string;

    @IsNumber()
    @IsOptional()
      defaultWeight?: number;

    @IsArray()
    @IsOptional()
    @ArrayUnique()
    @IsString({ each: true })
      equipments?: string[]; // 器械，数组
}
