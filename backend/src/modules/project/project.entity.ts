import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class Project {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop()
    description?: string;

    // 虚拟字段：当天的训练记录ID
    todayWorkoutId?: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// 添加虚拟字段
ProjectSchema.virtual('todayWorkoutId').get(function () {
    return this.todayWorkoutId;
}); 