import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { AppModule } from './app.module';

// 响应拦截器
const responseInterceptor = (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    res.json = function (data: any) {
        return originalJson.call(this, {
            code: 0,
            data,
            message: 'success'
        });
    };
    next();
};

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 全局管道
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
    }));

    // 全局响应拦截器
    app.use(responseInterceptor);

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