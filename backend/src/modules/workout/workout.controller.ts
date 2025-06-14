import { Controller, Get, Post, Body, Put, Param, Delete, Query, BadRequestException, Request, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateWorkoutDto } from './dto/create-workout.dto';
import { QueryWorkoutDto } from './dto/query-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { Workout } from './workout.entity';
import { WorkoutService } from './workout.service';

@Controller('workout')
@UseGuards(JwtAuthGuard)
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) { }

    @Get('find-all')
  findAll(@Request() req): Promise<Workout[]> {
    return this.workoutService.findAll(req.user.id);
  }

    /**
     * 获取按日期分组的训练记录列表
     * @param {number} page - 页码
     * @param {number} pageSize - 每页数量
     * @param {string} date - 日期
     * @param {string} projectId - 项目ID
     * @returns {Promise<{ data: Record<string, Workout[]>; total: number }>} 按日期分组的训练记录和总数
     */
    @Get('group-by-date')
    findAllGroupByDate(
        @Query('page') page: string,
        @Query('pageSize') pageSize: string,
        @Query('date') date: string,
        @Query('projectId') projectId: string,
        @Request() req
    ): Promise<{ data: Record<string, Workout[]>; total: number }> {
      const query: QueryWorkoutDto = {
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 10,
        date,
        projectId,
        userId: req.user.id
      };

      return this.workoutService.findAllGroupByDate(query);
    }

    /**
     * 获取按周分组的训练记录列表
     * @param {string} page - 页码
     * @param {string} pageSize - 每页数量
     * @param {string} date - 日期
     * @param {string} projectId - 项目ID
     * @param {Request} req - 请求对象
     * @returns {Promise<{ data: Record<string, { projectName: string; totalGroups: number; totalReps: number; totalDays: number }[]>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按周分组的训练记录和分页信息
     */
    @Get('group-by-week')
    findAllGroupByWeek(
        @Query('page') page: string,
        @Query('pageSize') pageSize: string,
        @Query('date') date: string,
        @Query('projectId') projectId: string,
        @Request() req
    ): Promise<{
        data: Record<string, {
            projectName: string;
            totalGroups: number;
            totalReps: number;
            totalDays: number;
        }[]>;
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
    }> {
      const query: QueryWorkoutDto = {
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 10,
        date,
        projectId,
        userId: req.user.id
      };

      return this.workoutService.findAllGroupByWeek(query);
    }

    /**
     * 获取按月分组的训练记录列表
     * @param {string} page - 页码
     * @param {string} pageSize - 每页数量
     * @param {string} date - 日期
     * @param {string} projectId - 项目ID
     * @param {Request} req - 请求对象
     * @returns {Promise<{ data: Record<string, { projectName: string; totalGroups: number; totalReps: number; totalDays: number }[]>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按月分组的训练记录和分页信息
     */
    @Get('group-by-month')
    findAllGroupByMonth(
        @Query('page') page: string,
        @Query('pageSize') pageSize: string,
        @Query('date') date: string,
        @Query('projectId') projectId: string,
        @Request() req
    ): Promise<{
        data: Record<string, {
            projectName: string;
            totalGroups: number;
            totalReps: number;
            totalDays: number;
        }[]>;
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
    }> {
      const query: QueryWorkoutDto = {
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 10,
        date,
        projectId,
        userId: req.user.id
      };

      return this.workoutService.findAllGroupByMonth(query);
    }

    /**
     * 获取按年分组的训练记录列表
     * @param {string} page - 页码
     * @param {string} pageSize - 每页数量
     * @param {string} date - 日期
     * @param {string} projectId - 项目ID
     * @param {Request} req - 请求对象
     * @returns {Promise<{ data: Record<string, { projectName: string; totalGroups: number; totalReps: number; totalDays: number }[]>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按年分组的训练记录和分页信息
     */
    @Get('group-by-year')
    findAllGroupByYear(
        @Query('page') page: string,
        @Query('pageSize') pageSize: string,
        @Query('date') date: string,
        @Query('projectId') projectId: string,
        @Request() req
    ): Promise<{
        data: Record<string, {
            projectName: string;
            totalGroups: number;
            totalReps: number;
            totalDays: number;
        }[]>;
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
    }> {
      const query: QueryWorkoutDto = {
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 10,
        date,
        projectId,
        userId: req.user.id
      };

      return this.workoutService.findAllGroupByYear(query);
    }

    /**
     * 根据日期和项目ID查找训练记录
     * @param {string} date - 日期
     * @param {string} projectId - 项目ID
     * @returns {Promise<Workout | null>} 训练记录或null
     */
    @Get('find-by-date-and-project')
    findByDateAndProject(
        @Query('date') date: string,
        @Query('projectId') projectId: string,
        @Request() req
    ): Promise<Workout | null> {
      return this.workoutService.findByDateAndProject(date, projectId, req.user.id);
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
        @Request() req
    ): Promise<{ data: Record<string, Workout[]>; total: number }> {
      if (!year || !month) {
        throw new BadRequestException('年份和月份不能为空');
      }
      return this.workoutService.findByYearMonth(year, month, req.user.id);
    }

    /**
     * 获取训练统计信息
     * @param {Request} req - 请求对象
     * @returns {Promise<{ weeklyDays: number; monthlyDays: number; continuousDays: number; totalDays: number; withoutWorkoutDays: number }>} 训练统计信息
     */
    @Get('stats')
    getWorkoutStats(@Request() req): Promise<{
        weeklyDays: number;
        monthlyDays: number;
        continuousDays: number;
        totalDays: number;
        withoutWorkoutDays: number;
    }> {
      return this.workoutService.getWorkoutStats(req.user.id);
    }

    @Get('get/:id')
    findOne(@Param('id') id: string, @Request() req): Promise<Workout> {
      return this.workoutService.findOne(id, req.user.id);
    }

    /**
     * 创建新的训练记录
     * @param {CreateWorkoutDto} createWorkoutDto - 创建训练记录的数据
     * @param {Request} req - 请求对象
     * @returns {Promise<Workout>} 创建的训练记录
     */
    @Post('create')
    create(@Body() createWorkoutDto: CreateWorkoutDto, @Request() req): Promise<Workout> {
      return this.workoutService.create(createWorkoutDto, req.user.id);
    }

    /**
     * 更新训练记录
     * @param {string} id - 训练记录ID
     * @param {UpdateWorkoutDto} updateWorkoutDto - 更新训练记录的数据
     * @param {Request} req - 请求对象
     * @returns {Promise<Workout>} 更新后的训练记录
     */
    @Put('update/:id')
    update(
        @Param('id') id: string,
        @Body() updateWorkoutDto: UpdateWorkoutDto,
        @Request() req
    ): Promise<Workout> {
      return this.workoutService.update(id, updateWorkoutDto, req.user.id);
    }

    @Delete('delete/:id')
    remove(@Param('id') id: string, @Request() req): Promise<void> {
      return this.workoutService.remove(id, req.user.id);
    }
}
