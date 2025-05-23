import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { mongooseConfig } from './config/mongoose.config';
import { ProjectModule } from './modules/project/project.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
    imports: [
        // 配置模块
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        // 数据库模块
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI', mongooseConfig.uri),
                user: configService.get<string>('MONGODB_USER', mongooseConfig.user),
                pass: configService.get<string>('MONGODB_PASS', mongooseConfig.pass),
                authSource: configService.get<string>('MONGODB_AUTH_SOURCE', mongooseConfig.authSource),
            }),
            inject: [ConfigService],
        }),
        // 业务模块
        ProjectModule,
        WorkoutModule,
        AuthModule,
    ],
})
export class AppModule { } 