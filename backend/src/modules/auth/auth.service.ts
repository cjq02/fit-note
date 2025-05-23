import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './auth.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ) { }

    // 注册
    async register(registerDto: RegisterDto): Promise<void> {
        const { username, password } = registerDto;

        // 检查用户名是否已存在
        const existingUser = await this.userModel.findOne({ username });
        if (existingUser) {
            throw new ConflictException('用户名已存在');
        }

        // 创建新用户（密码会在保存前自动加密）
        await this.userModel.create({ username, password });
    }

    // 登录
    async login(loginDto: LoginDto) {
        const { username, password } = loginDto;

        // 查找用户
        const user = await this.userModel.findOne({ username });
        if (!user) {
            throw new UnauthorizedException('用户名或密码错误');
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('用户名或密码错误');
        }

        // 生成 token
        const token = this.jwtService.sign({
            sub: user.id,
            username: user.username,
        });

        return {
            token,
            user: {
                id: user.id,
                username: user.username,
            },
        };
    }

    // 获取用户信息
    async getProfile(user: UserDocument) {
        return {
            user: {
                id: user.id,
                username: user.username,
            },
        };
    }
} 