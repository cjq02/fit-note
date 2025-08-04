import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueryWorkoutDto } from '../workout/dto/query-workout.dto';

import { StatsService } from './stats.service';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) { }


  /**
   * 获取按周分组的训练记录列表
   * @param {string} page - 页码
   * @param {string} pageSize - 每页数量
   * @param {string} date - 日期
   * @param {string} projectId - 项目ID
   * @param {Request} req - 请求对象
   * @returns {Promise<{ data: Array<{ period: string; stats: Array<{ projectName: string; totalGroups: number; totalReps: number; totalDays: number }> }>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按周分组的训练记录和分页信息
   */
  @Get('group-by-week')
  async findAllGroupByWeek(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('date') date: string,
    @Query('projectId') projectId: string,
    @Request() req
  ): Promise<{
    data: Array<{
      period: string;
      stats: Array<{ projectName: string; totalGroups: number; totalReps: number; totalDays: number }>;
    }>;
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

    return this.statsService.findAllGroupByWeek(query);
  }

  /**
   * 获取按月分组的训练记录列表
   * @param {string} page - 页码
   * @param {string} pageSize - 每页数量
   * @param {string} date - 日期
   * @param {string} projectId - 项目ID
   * @param {Request} req - 请求对象
   * @returns {Promise<{ data: Array<{ period: string; stats: Array<{ projectName: string; totalGroups: number; totalReps: number; totalDays: number }> }>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按月分组的训练记录和分页信息
   */
  @Get('group-by-month')
  async findAllGroupByMonth(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('date') date: string,
    @Query('projectId') projectId: string,
    @Request() req
  ): Promise<{
    data: Array<{
      period: string;
      stats: Array<{ projectName: string; totalGroups: number; totalReps: number; totalDays: number }>;
    }>;
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

    return this.statsService.findAllGroupByMonth(query);
  }

  /**
   * 获取按年分组的训练记录列表
   * @param {string} page - 页码
   * @param {string} pageSize - 每页数量
   * @param {string} date - 日期
   * @param {string} projectId - 项目ID
   * @param {Request} req - 请求对象
   * @returns {Promise<{ data: Array<{ period: string; stats: Array<{ projectName: string; totalGroups: number; totalReps: number; totalDays: number }> }>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按年分组的训练记录和分页信息
   */
  @Get('group-by-year')
  async findAllGroupByYear(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('date') date: string,
    @Query('projectId') projectId: string,
    @Request() req
  ): Promise<{
    data: Array<{
      period: string;
      stats: Array<{ projectName: string; totalGroups: number; totalReps: number; totalDays: number }>;
    }>;
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

    return this.statsService.findAllGroupByYear(query);
  }

  /**
   * 获取按周根据category分组的训练记录列表
   * @param {string} page - 页码
   * @param {string} pageSize - 每页数量
   * @param {string} date - 日期
   * @param {string} projectId - 项目ID
   * @param {Request} req - 请求对象
   * @returns {Promise<{ data: Array<{ period: string; periodTotalDays: number; stats: Array<{ category: string; categoryName: string; totalDays: number; totalGroups: number; totalReps: number }> }>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按周根据category分组的训练记录和分页信息
   */
  @Get('group-by-week-category')
  async findAllGroupByWeekCategory(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('date') date: string,
    @Query('projectId') projectId: string,
    @Request() req
  ): Promise<{
    data: Array<{
      period: string;
      periodTotalDays: number;
      stats: Array<{ category: string; categoryName: string; totalDays: number; totalGroups: number; totalReps: number }>;
    }>;
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

    return this.statsService.findAllGroupByWeekCategory(query);
  }

  /**
   * 获取按月根据category分组的训练记录列表
   * @param {string} page - 页码
   * @param {string} pageSize - 每页数量
   * @param {string} date - 日期
   * @param {string} projectId - 项目ID
   * @param {Request} req - 请求对象
   * @returns {Promise<{ data: Array<{ period: string; periodTotalDays: number; stats: Array<{ category: string; categoryName: string; totalDays: number; totalGroups: number; totalReps: number }> }>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按月根据category分组的训练记录和分页信息
   */
  @Get('group-by-month-category')
  async findAllGroupByMonthCategory(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('date') date: string,
    @Query('projectId') projectId: string,
    @Request() req
  ): Promise<{
    data: Array<{
      period: string;
      periodTotalDays: number;
      stats: Array<{ category: string; categoryName: string; totalDays: number; totalGroups: number; totalReps: number }>;
    }>;
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

    return this.statsService.findAllGroupByMonthCategory(query);
  }

  /**
   * 获取按年根据category分组的训练记录列表
   * @param {string} page - 页码
   * @param {string} pageSize - 每页数量
   * @param {string} date - 日期
   * @param {string} projectId - 项目ID
   * @param {Request} req - 请求对象
   * @returns {Promise<{ data: Array<{ period: string; periodTotalDays: number; stats: Array<{ category: string; categoryName: string; totalDays: number; totalGroups: number; totalReps: number }> }>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按年根据category分组的训练记录和分页信息
   */
  @Get('group-by-year-category')
  async findAllGroupByYearCategory(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('date') date: string,
    @Query('projectId') projectId: string,
    @Request() req
  ): Promise<{
    data: Array<{
      period: string;
      periodTotalDays: number;
      stats: Array<{ category: string; categoryName: string; totalDays: number; totalGroups: number; totalReps: number }>;
    }>;
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

    return this.statsService.findAllGroupByYearCategory(query);
  }

  /**
   * 按年月获取训练记录列表
   * @param {string} year - 年份
   * @param {string} month - 月份
   * @returns {Promise<{ data: Record<string, any[]>; total: number }>} 按日期分组的训练记录和总数
   */
  @Get('by-year-month')
  findByYearMonth(
    @Query('year') year: string,
    @Query('month') month: string,
    @Request() req
  ): Promise<{ data: Record<string, unknown[]>; total: number }> {
    return this.statsService.findByYearMonth(year, month, req.user.id);
  }

  /**
   * 获取训练统计信息
   * @param {Request} req - 请求对象
   * @returns {Promise<{ weeklyDays: number; monthlyDays: number; continuousDays: number; totalDays: number; withoutWorkoutDays: number }>} 训练统计信息
   */
  @Get('workout-stats')
  getWorkoutStats(@Request() req): Promise<{
    weeklyDays: number;
    monthlyDays: number;
    continuousDays: number;
    totalDays: number;
    withoutWorkoutDays: number;
  }> {
    return this.statsService.getWorkoutStats(req.user.id);
  }
}
