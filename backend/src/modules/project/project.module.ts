import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Project, ProjectSchema } from './project.entity';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { WorkoutModule } from '../workout/workout.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Project.name, schema: ProjectSchema }
        ]),
        forwardRef(() => WorkoutModule),
    ],
    controllers: [ProjectController],
    providers: [ProjectService],
    exports: [ProjectService],
})
export class ProjectModule { } 