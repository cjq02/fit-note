import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ required: true })
    userId: string;

    // 当天的训练记录ID，由 service 层处理
    todayWorkoutId?: string;

    // 创建时间，由 timestamps 自动管理
    createdAt?: Date;

    // 更新时间，由 timestamps 自动管理
    updatedAt?: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
