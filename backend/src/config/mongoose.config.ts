import { MongooseModuleOptions } from '@nestjs/mongoose';
import mongoose from 'mongoose';

// 创建全局转换插件
const idTransformPlugin = (schema: mongoose.Schema) => {
    const transform = (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    };

    schema.set('toJSON', {
        virtuals: true,
        transform
    });

    schema.set('toObject', {
        virtuals: true,
        transform
    });
};

// 注册全局插件
mongoose.plugin(idTransformPlugin);

export const mongooseConfig: MongooseModuleOptions = {
    uri: process.env.MONGODB_URI || 'mongodb://8.134.250.114:27017/fit-note',
    user: process.env.MONGODB_USER || 'admin',
    pass: process.env.MONGODB_PASS || 'password123',
    authSource: process.env.MONGODB_AUTH_SOURCE || 'admin',
};
