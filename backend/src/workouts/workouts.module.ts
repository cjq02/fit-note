import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { Workout, WorkoutSchema } from './schemas/workout.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Workout.name, schema: WorkoutSchema }]),
    ],
    controllers: [WorkoutsController],
    providers: [WorkoutsService],
})
export class WorkoutsModule { } 