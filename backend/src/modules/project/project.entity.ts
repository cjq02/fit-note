import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema()
export class Project {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop()
    description?: string;

    // 当天的训练记录ID，由 service 层处理
    todayWorkoutId?: string;
}

export const ProjectSchema = SchemaFactory.createForClass(Project); 