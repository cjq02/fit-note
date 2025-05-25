import { Controller, Get, Post, Body, Put, Param, Delete, Query, BadRequestException } from '@nestjs/common';

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
    findAllGroupByDate(@Query('params') params: any): Promise<{ data: Record<string, Workout[]>; total: number }> {
        const page = Number(params?.page) || 1;
        const pageSize = Number(params?.pageSize) || 10;
        const date = params?.date;
        const project = params?.project;

        const query: QueryWorkoutDto = {
            page,
            pageSize,
            date,
            project
        };

        return this.workoutService.findAllGroupByDate(query);
    }

    @Get('find')
    findByDateAndProject(
        @Query('params') params: { date: string; projectId: string },
    ): Promise<Workout | null> {
        return this.workoutService.findByDateAndProject(params.date, params.projectId);
    }

    /**
     * 按年月获取训练记录列表
     * @param {string} year - 年份
     * @param {string} month - 月份
     * @returns {Promise<{ data: Record<string, Workout[]>; total: number }>} 按日期分组的训练记录和总数
     */
    @Get('by-year-month')
    findByYearMonth(
        @Query('year') year: string,
        @Query('month') month: string,
    ): Promise<{ data: Record<string, Workout[]>; total: number }> {
        if (!year || !month) {
            throw new BadRequestException('年份和月份不能为空');
        }
        return this.workoutService.findByYearMonth(year, month);
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
