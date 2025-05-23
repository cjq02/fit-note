import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ProjectModule } from './modules/project/project.module';
import { WorkoutModule } from './modules/workout/workout.module';

@Module({
    imports: [
        // 配置模块
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        // 数据库模块
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get('MONGODB_URI', 'mongodb://localhost:27017/fit_note'),
                user: configService.get('MONGODB_USER', 'root'),
                pass: configService.get('MONGODB_PASS', 'root'),
                authSource: configService.get('MONGODB_AUTH_SOURCE', 'admin'),
            }),
            inject: [ConfigService],
        }),
        // 业务模块
        ProjectModule,
        WorkoutModule,
    ],
})
export class AppModule { } 