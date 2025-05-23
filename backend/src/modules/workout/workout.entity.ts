import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Project } from '../project/project.entity';

export type WorkoutDocument = Workout & Document;

@Schema({ timestamps: true })
export class Workout {
    @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
    projectId: Types.ObjectId;

    @Prop({ type: () => Project })
    project: Project;

    @Prop({ required: true, type: Number, min: 0, max: 1000 })
    weight: number;

    @Prop({ required: true, type: Number, min: 1, max: 1000 })
    reps: number;

    @Prop()
    notes?: string;
}

export const WorkoutSchema = SchemaFactory.createForClass(Workout); 