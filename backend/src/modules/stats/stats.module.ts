import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProjectModule } from '../project/project.module';
import { Workout, WorkoutSchema } from '../workout/workout.entity';
import { WorkoutModule } from '../workout/workout.module';

import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workout.name, schema: WorkoutSchema }
    ]),
    forwardRef(() => WorkoutModule),
    forwardRef(() => ProjectModule)
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService]
})
export class StatsModule {}
