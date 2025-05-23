import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 全局管道
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
    }));

    // 全局前缀
    app.setGlobalPrefix('api');

    // 启用 CORS
    app.enableCors();

    // 启动服务器
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`服务器运行在 http://localhost:${port}`);
}

bootstrap(); 