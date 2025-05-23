import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ProjectModule } from './modules/project/project.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { globalSchemaOptions } from './config/mongoose.config';

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
                uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/fit_note'),
                user: configService.get<string>('MONGODB_USER', 'admin'),
                pass: configService.get<string>('MONGODB_PASS', 'password123'),
                authSource: configService.get<string>('MONGODB_AUTH_SOURCE', 'admin'),
                connectionFactory: (connection) => {
                    // 应用全局 Schema 配置
                    connection.plugin((schema) => {
                        schema.set('timestamps', globalSchemaOptions.timestamps);
                        schema.set('toJSON', globalSchemaOptions.toJSON);
                    });
                    return connection;
                },
            }),
            inject: [ConfigService],
        }),
        // 业务模块
        ProjectModule,
        WorkoutModule,
    ],
})
export class AppModule { } 