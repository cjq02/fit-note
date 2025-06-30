import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'debug', 'log', 'verbose'],
    });

    // 全局管道
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const messages = errors.map(error => {
          const constraints = error.constraints;
          return Object.values(constraints)[0];
        });
        return new BadRequestException(messages);
      },
    }));

    // 全局异常过滤器
    app.useGlobalFilters(new HttpExceptionFilter());

    // 全局响应转换拦截器
    app.useGlobalInterceptors(new TransformInterceptor());

    // 全局前缀
    app.setGlobalPrefix('api');

    // 启用 CORS
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // 启动服务器
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`服务器运行在 http://localhost:${port}`);
  } catch (error) {
    logger.error(`启动失败: ${error.message}`, error.stack);
    process.exit(1);
  }
}

bootstrap();
