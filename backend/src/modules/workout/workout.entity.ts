import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkoutDocument = Workout & Document;

// 训练组类型
export class WorkoutGroup {
    @Prop({ required: true, type: Number, min: 1, max: 1000 })
    reps: number;

    @Prop({ required: true, type: Number, min: 0, max: 1000 })
    weight: number;

    @Prop({ required: true, type: Number, min: 1 })
    seqNo: number;

    @Prop({ type: Number, default: 0, min: 0 })
    restTime: number;
}

@Schema({ timestamps: true })
export class Workout {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    date: string;

    @Prop({ required: true })
    project: string;

    @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
    projectId: Types.ObjectId;

    @Prop({ required: true, enum: ['kg', 'lb'] })
    unit: 'kg' | 'lb';

    @Prop({ type: [WorkoutGroup], required: true })
    groups: WorkoutGroup[];
}

export const WorkoutSchema = SchemaFactory.createForClass(Workout);
