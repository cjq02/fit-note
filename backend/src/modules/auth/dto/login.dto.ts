import { IsString, Length, IsOptional } from 'class-validator';

export class LoginDto {
    @IsString()
    @Length(3, 20)
      username: string;

    @IsString()
    @Length(6, 20)
      password: string;

    @IsOptional()
    @IsString()
      captcha?: string;

    @IsOptional()
    @IsString()
      captchaId?: string;
}
