import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Workout, WorkoutSchema } from './workout.entity';
import { WorkoutService } from './workout.service';
import { WorkoutController } from './workout.controller';
import { ProjectModule } from '../project/project.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Workout.name, schema: WorkoutSchema }
        ]),
        forwardRef(() => ProjectModule),
    ],
    controllers: [WorkoutController],
    providers: [WorkoutService],
    exports: [WorkoutService],
})
export class WorkoutModule { } 