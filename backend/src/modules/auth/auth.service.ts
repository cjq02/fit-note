import { Injectable, UnauthorizedException, ConflictException, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';

import { captchaStore } from './auth.controller';
import { User, UserDocument } from './auth.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

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
    const { username, password, captcha, captchaId } = registerDto;
    this.logger.debug(`尝试注册用户: ${username}`);

    // 校验图形验证码
    if (!captchaId || !captcha) {
      throw new UnauthorizedException('请输入验证码');
    }
    const real = captchaStore.get(captchaId);
    if (!real || captcha.toLowerCase() !== real) {
      throw new UnauthorizedException('验证码错误');
    }
    captchaStore.delete(captchaId);

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
    const { username, password, captcha, captchaId } = loginDto;
    this.logger.debug(`尝试登录用户: ${username}`);

    try {
      // 查找用户
      const user = await this.userModel.findOne({ username }).exec();
      this.logger.debug(`数据库查询结果: ${JSON.stringify(user)}`);

      if (!user) {
        this.logger.debug(`用户不存在: ${username}`);
        throw new UnauthorizedException('用户名不存在');
      }

      // 检查登录失败次数
      if (user.loginFailCount >= 5) {
        // 需要图片验证码
        if (!captchaId || !captcha) {
          throw new UnauthorizedException('请输入验证码');
        }
        const real = captchaStore.get(captchaId);
        if (!real || captcha.toLowerCase() !== real) {
          throw new UnauthorizedException('验证码错误');
        }
        // 校验通过后删除验证码
        captchaStore.delete(captchaId);
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      this.logger.debug(`密码验证结果: ${isPasswordValid}`);

      if (!isPasswordValid) {
        this.logger.debug(`密码错误: ${username}`);
        // 增加失败次数
        user.loginFailCount = (user.loginFailCount || 0) + 1;
        user.lastLoginFailAt = new Date();
        await user.save();
        if (user.loginFailCount >= 5) {
          throw new UnauthorizedException('密码错误，需输入验证码');
        }
        throw new UnauthorizedException('密码错误');
      }

      // 登录成功，重置失败次数
      user.loginFailCount = 0;
      await user.save();

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
        needCaptcha: false,
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

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    const isOldPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new HttpException('旧密码错误', HttpStatus.BAD_REQUEST);
    }
    user.password = dto.newPassword;
    await user.save();
    return true;
  }
}
