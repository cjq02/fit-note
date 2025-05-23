import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workout, WorkoutDocument } from './schemas/workout.schema';

@Injectable()
export class WorkoutsService {
    constructor(
        @InjectModel(Workout.name) private workoutModel: Model<WorkoutDocument>,
    ) { }

    async create(workout: Workout): Promise<Workout> {
        const createdWorkout = new this.workoutModel(workout);
        return createdWorkout.save();
    }

    async findAll(): Promise<Workout[]> {
        return this.workoutModel.find().exec();
    }

    async findOne(id: string): Promise<Workout> {
        return this.workoutModel.findById(id).exec();
    }

    async update(id: string, workout: Workout): Promise<Workout> {
        return this.workoutModel
            .findByIdAndUpdate(id, workout, { new: true })
            .exec();
    }

    async remove(id: string): Promise<Workout> {
        return this.workoutModel.findByIdAndDelete(id).exec();
    }
} 