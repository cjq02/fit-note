import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { v4 as uuidv4 } from 'uuid';

import { UserDocument } from './auth.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

export const captchaStore = new Map<string, string>();

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

    @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

    @Post('login')
    login(@Body() loginDto: LoginDto) {
      return this.authService.login(loginDto);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@CurrentUser() user: UserDocument) {
      return this.authService.getProfile(user);
    }

    @Get('captcha')
    getCaptcha() {
      // 生成4位字母数字验证码，字体更大更黑、无干扰线、白底
      const captcha = svgCaptcha.create({
        size: 4,
        noise: 0,
        color: false, // 字体黑色
        background: '#f5f5f5', // 淡灰色背景
        fontSize: 60,
        width: 140,
        height: 48,
        ignoreChars: '0o1ilI',
      });
      const id = uuidv4();
      captchaStore.set(id, captcha.text.toLowerCase());
      // 5分钟后自动清除
      setTimeout(() => captchaStore.delete(id), 5 * 60 * 1000);
      return {
        id,
        data: 'data:image/svg+xml;base64,' + Buffer.from(captcha.data).toString('base64'),
      };
    }

    @UseGuards(JwtAuthGuard)
    @Post('change-password')
    async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
      const userId = req.user?._id;
      await this.authService.changePassword(userId, dto);
      return { message: '密码修改成功' };
    }
}
