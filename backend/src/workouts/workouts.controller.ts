import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { WorkoutsService } from './workouts.service';
import { Workout } from './schemas/workout.schema';

@Controller('workouts')
export class WorkoutsController {
    constructor(private readonly workoutsService: WorkoutsService) { }

    @Post()
    create(@Body() workout: Workout) {
        return this.workoutsService.create(workout);
    }

    @Get()
    findAll() {
        return this.workoutsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.workoutsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() workout: Workout) {
        return this.workoutsService.update(id, workout);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.workoutsService.remove(id);
    }
} 