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
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @param {string} date - 日期
     * @param {string} project - 项目
     * @returns {Promise<{ data: Record<string, Workout[]>; total: number }>} 按日期分组的训练记录和总数
     */
    @Get('group-by-date')
    findAllGroupByDate(
        @Query('page') page: string,
        @Query('pageSize') pageSize: string,
        @Query('date') date: string,
        @Query('project') project: string,
    ): Promise<{ data: Record<string, Workout[]>; total: number }> {
        const query: QueryWorkoutDto = {
            page: Number(page) || 1,
            pageSize: Number(pageSize) || 10,
            date,
            project
        };

        return this.workoutService.findAllGroupByDate(query);
    }

    /**
     * 根据日期和项目ID查找训练记录
     * @param {string} date - 日期
     * @param {string} projectId - 项目ID
     * @returns {Promise<Workout | null>} 训练记录或null
     */
    @Get('find')
    findByDateAndProject(
        @Query('date') date: string,
        @Query('projectId') projectId: string,
    ): Promise<Workout | null> {
        return this.workoutService.findByDateAndProject(date, projectId);
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
