import { IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
    @IsString()
    @Length(3, 20)
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: '用户名只能包含字母、数字和下划线',
    })
    username: string;

    @IsString()
    @Length(6, 20)
    password: string;
} 