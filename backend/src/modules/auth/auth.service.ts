import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './auth.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        private jwtService: JwtService,
    ) { }

    // 注册
    async register(registerDto: RegisterDto): Promise<void> {
        const { username, password } = registerDto;
        this.logger.debug(`尝试注册用户: ${username}`);

        // 检查用户名是否已存在
        const existingUser = await this.userModel.findOne({ username });
        if (existingUser) {
            this.logger.debug(`用户名已存在: ${username}`);
            throw new ConflictException('用户名已存在');
        }

        // 创建新用户（密码会在保存前自动加密）
        await this.userModel.create({ username, password });
        this.logger.debug(`用户注册成功: ${username}`);
    }

    // 登录
    async login(loginDto: LoginDto) {
        const { username, password } = loginDto;
        this.logger.debug(`尝试登录用户: ${username}`);

        try {
            // 查找用户
            const user = await this.userModel.findOne({ username }).exec();
            this.logger.debug(`数据库查询结果: ${JSON.stringify(user)}`);

            if (!user) {
                this.logger.debug(`用户不存在: ${username}`);
                throw new UnauthorizedException('用户名不存在');
            }

            // 验证密码
            const isPasswordValid = await bcrypt.compare(password, user.password);
            this.logger.debug(`密码验证结果: ${isPasswordValid}`);

            if (!isPasswordValid) {
                this.logger.debug(`密码错误: ${username}`);
                throw new UnauthorizedException('密码错误');
            }

            this.logger.debug(`用户登录成功: ${username}`);

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
        } catch (error) {
            this.logger.error(`登录失败: ${error.message}`, error.stack);
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('登录失败，请稍后重试');
        }
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
