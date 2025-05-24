import { Controller, Get, Post, Body, Put, Param, Delete, Query } from '@nestjs/common';

import { WorkoutService } from './workout.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { QueryWorkoutDto } from './dto/query-workout.dto';
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
     * @param {QueryWorkoutDto} query - 查询参数
     * @returns {Promise<{ data: Record<string, Workout[]>; total: number }>} 按日期分组的训练记录和总数
     */
    @Get('group-by-date')
    findAllGroupByDate(@Query() query: QueryWorkoutDto): Promise<{ data: Record<string, Workout[]>; total: number }> {
        return this.workoutService.findAllGroupByDate(query);
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
