import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { v4 as uuidv4 } from 'uuid';

import { UserDocument } from './auth.entity';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
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
      // 生成4位字母数字验证码
      const captcha = svgCaptcha.create({ size: 4, noise: 2, ignoreChars: '0o1ilI', color: true, background: '#fff' });
      const id = uuidv4();
      captchaStore.set(id, captcha.text.toLowerCase());
      // 5分钟后自动清除
      setTimeout(() => captchaStore.delete(id), 5 * 60 * 1000);
      return {
        id,
        data: 'data:image/svg+xml;base64,' + Buffer.from(captcha.data).toString('base64'),
      };
    }
}
