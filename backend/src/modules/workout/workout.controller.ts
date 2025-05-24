import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';

import { WorkoutService } from './workout.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { Workout } from './workout.entity';

@Controller('workouts')
export class WorkoutController {
    constructor(private readonly workoutService: WorkoutService) { }

    @Get()
    findAll(): Promise<Workout[]> {
        return this.workoutService.findAll();
    }

    /**
     * 获取按日期分组的训练记录列表
     * @returns {Promise<Record<string, Workout[]>>} 按日期分组的训练记录
     */
    @Get('group-by-date')
    findAllGroupByDate(): Promise<Record<string, Workout[]>> {
        return this.workoutService.findAllGroupByDate();
    }

    @Get('find')
    findByDateAndProject(
        @Query('params') params: { date: string; projectId: string },
    ): Promise<Workout | null> {
        return this.workoutService.findByDateAndProject(params.date, params.projectId);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Workout> {
        return this.workoutService.findOne(id);
    }

    @Post()
    create(@Body() createWorkoutDto: CreateWorkoutDto): Promise<Workout> {
        return this.workoutService.create(createWorkoutDto);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateWorkoutDto: UpdateWorkoutDto,
    ): Promise<Workout> {
        return this.workoutService.update(id, updateWorkoutDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.workoutService.remove(id);
    }
}
