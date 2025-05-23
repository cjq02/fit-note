import { SchemaOptions } from '@nestjs/mongoose';

// 全局 Mongoose Schema 配置
export const globalSchemaOptions: SchemaOptions = {
    timestamps: true,
    toJSON: {
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
}; 