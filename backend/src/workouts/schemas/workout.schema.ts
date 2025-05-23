import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WorkoutDocument = Workout & Document;

@Schema()
export class Exercise {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    sets: number;

    @Prop({ required: true })
    reps: number;

    @Prop({ required: true })
    weight: number;
}

@Schema()
export class Workout {
    @Prop({ required: true })
    date: Date;

    @Prop({ required: true })
    type: string;

    @Prop({ required: true })
    duration: number;

    @Prop({ type: [Exercise], required: true })
    exercises: Exercise[];
}

export const WorkoutSchema = SchemaFactory.createForClass(Workout); 