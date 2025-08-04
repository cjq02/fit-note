import { CATEGORY_OPTIONS } from '@fit-note/shared-utils/dict.options';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { Model } from 'mongoose';

import { ProjectService } from '../project/project.service';
import { QueryWorkoutDto } from '../workout/dto/query-workout.dto';
import { Workout } from '../workout/workout.entity';
import { WorkoutService } from '../workout/workout.service';

@Injectable()
export class StatsService {

  constructor(
    @InjectModel(Workout.name)
    private workoutModel: Model<Workout>,
    @Inject(forwardRef(() => WorkoutService))
    private workoutService: WorkoutService,
    @Inject(forwardRef(() => ProjectService))
    private projectService: ProjectService,
  ) { }

  /**
   * 通用分组查询方法
   * @param {QueryWorkoutDto} query - 查询参数
   * @param {Object} options - 分组选项
   * @param {string} options.dateFormat - 日期格式
   * @param {number} options.periodsToShow - 要显示的周期数
   * @param {string} options.periodUnit - 周期单位（week/month/year）
   * @returns {Promise<{ data: Record<string, { projectName: string; totalGroups: number; totalReps: number; totalDays: number }[]>; total: number; page: number; pageSize: number; hasMore: boolean }>} 分组统计结果
   */
  private async findAllGroupByPeriod(
    query: QueryWorkoutDto,
    options: {
    dateFormat: string;
    periodsToShow: number;
    periodUnit: 'week' | 'month' | 'year';
  }
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
    // 构建日期范围条件
    const { conditions, startDate } = this.buildDateRangeConditions(query, {
      periodUnit: options.periodUnit,
      periodsToShow: options.periodsToShow
    });

    // 1. 获取所有训练记录
    const workouts = await this.workoutModel
      .find(conditions)
      .sort({ date: -1, _id: -1 })
      .exec();

    // 2. 获取项目名称映射和排序映射
    const { nameMap, seqNoMap } = await this.workoutService.getProjectMaps(workouts, query.userId);

    // 3. 按周期和项目分组
    const periodGroups = this.initializePeriodGroups(query, {
      periodUnit: options.periodUnit,
      periodsToShow: options.periodsToShow,
      dateFormat: options.dateFormat
    }, startDate);

    // 4. 填充数据
    workouts.forEach(workout => {
      const periodKey = this.generatePeriodKey(workout.date, {
        periodUnit: options.periodUnit,
        dateFormat: options.dateFormat
      });

      if (periodGroups[periodKey]) {
        const projectId = workout.projectId.toString();
        if (!periodGroups[periodKey][projectId]) {
          periodGroups[periodKey][projectId] = {
            workouts: [],
            uniqueDates: new Set()
          };
        }
        periodGroups[periodKey][projectId].workouts.push(workout);
        periodGroups[periodKey][projectId].uniqueDates.add(workout.date);
      }
    });

    // 5. 计算统计数据
    const result = this.calculateGroupStats(periodGroups, nameMap, seqNoMap);

    // 6. 转换为列表格式，并统计每个周期的训练天数（去重）
    let data = Object.entries(result).map(([period, stats]) => {
      // 统计该周期所有项目的 uniqueDates 的并集
      const projectGroups = periodGroups[period] || {};
      const allDatesSet = new Set<string>();
      Object.values(projectGroups).forEach(g => {
        g.uniqueDates.forEach(date => allDatesSet.add(date));
      });
      return {
        period,
        periodTotalDays: allDatesSet.size,
        stats
      };
    });

    // 按 period 降序排序（年份大的在前面）
    data = data.sort((a, b) => b.period.localeCompare(a.period));

    // 7. 处理分页
    return this.handlePagination(data, query);
  }

  /**
   * 获取按年分组的训练记录
   */
  async findAllGroupByYear(query: QueryWorkoutDto): Promise<{
    data: Array<{
      period: string;
      stats: Array<{ projectName: string; totalGroups: number; totalReps: number; totalDays: number }>;
    }>;
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }> {
    return this.findAllGroupByPeriod(query, {
      dateFormat: 'YYYY',
      periodsToShow: query.pageSize,
      periodUnit: 'year'
    });
  }

  /**
   * 获取按周分组获取训练记录
   */
  async findAllGroupByWeek(query: QueryWorkoutDto): Promise<{
    data: Array<{
      period: string;
      stats: Array<{ projectName: string; totalGroups: number; totalReps: number; totalDays: number }>;
    }>;
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }> {
    return this.findAllGroupByPeriod(query, {
      dateFormat: 'YYYY-MM-DD',
      periodsToShow: query.pageSize,
      periodUnit: 'week'
    });
  }

  /**
   * 获取按月分组的训练记录
   */
  async findAllGroupByMonth(query: QueryWorkoutDto): Promise<{
    data: Array<{
      period: string;
      stats: Array<{ projectName: string; totalGroups: number; totalReps: number; totalDays: number }>;
    }>;
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }> {
    return this.findAllGroupByPeriod(query, {
      dateFormat: 'YYYY-MM',
      periodsToShow: query.pageSize,
      periodUnit: 'month'
    });
  }

  /**
   * 计算分组统计数据
   * @param {Record<string, Record<string, { workouts: Workout[]; uniqueDates: Set<string> }>>} groups - 分组数据
   * @param {Map<string, string>} nameMap - 项目名称映射
   * @param {Map<string, number>} seqNoMap - 项目排序号映射
   * @returns {Record<string, { projectName: string; totalGroups: number; totalReps: number; totalDays: number }[]>} 分组统计结果
   */
  private calculateGroupStats(
    groups: Record<string, Record<string, { workouts: Workout[]; uniqueDates: Set<string> }>>,
    nameMap: Map<string, string>,
    seqNoMap: Map<string, number>
  ): Record<string, { projectName: string; totalGroups: number; totalReps: number; totalDays: number }[]> {
    const result: Record<string, { projectName: string; totalGroups: number; totalReps: number; totalDays: number }[]> = {};

    // 获取所有键并按日期降序排序
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      // 检查是否是年份格式（4位数字）
      const isYearA = /^\d{4}$/.test(a);
      const isYearB = /^\d{4}$/.test(b);

      if (isYearA && isYearB) {
        // 如果是年份，使用数字比较
        return Number(b) - Number(a);
      }

      // 其他情况使用字符串比较
      return b.localeCompare(a);
    });

    sortedKeys.forEach((key) => {
      const projects = groups[key];
      result[key] = Object.entries(projects).map(([projectId, data]) => {
        const projectName = nameMap.get(projectId) || '未知项目';
        const totalGroups = data.workouts.reduce((sum, w) => sum + w.groups.length, 0);
        const totalReps = data.workouts.reduce((sum, w) =>
          sum + w.groups.reduce((groupSum, g) => groupSum + g.reps, 0), 0);
        const totalDays = data.uniqueDates.size;

        return {
          projectName,
          totalGroups,
          totalReps,
          totalDays
        };
      });

      // 按项目排序号排序
      result[key].sort((a, b) => {
        const projectA = Object.entries(projects).find(([_, data]) =>
          nameMap.get(data.workouts[0].projectId.toString()) === a.projectName);
        const projectB = Object.entries(projects).find(([_, data]) =>
          nameMap.get(data.workouts[0].projectId.toString()) === b.projectName);

        const seqNoA = projectA ? seqNoMap.get(projectA[0]) || 0 : 0;
        const seqNoB = projectB ? seqNoMap.get(projectB[0]) || 0 : 0;
        return seqNoA - seqNoB;
      });
    });

    return result;
  }

  /**
     * 获取训练统计信息
     * @param {string} userId - 用户ID
     * @returns {Promise<{ weeklyDays: number; monthlyDays: number; continuousDays: number; totalDays: number; withoutWorkoutDays: number }>} 训练统计信息
     */
  async getWorkoutStats(userId: string): Promise<{
  weeklyDays: number;
  monthlyDays: number;
  continuousDays: number;
  totalDays: number;
  withoutWorkoutDays: number;
}> {
    // 获取当前日期
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // 计算本周开始日期（周一为每周第一天）
    const weekStart = new Date(now);
    const day = now.getDay() || 7; // 将周日的0转换为7
    weekStart.setDate(now.getDate() - day + 1); // 减去当前是周几，再加1得到本周一
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // 计算本月开始日期
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthStartStr = monthStart.toISOString().split('T')[0];

    // 获取所有训练记录
    const workouts = await this.workoutModel
      .find({
        userId,
        date: { $lte: today }
      })
      .sort({ date: -1 })
      .exec();

    // 获取唯一的训练日期
    const uniqueDates = [...new Set(workouts.map(w => w.date))].sort().reverse();

    // 计算本周训练天数
    const weeklyDays = uniqueDates.filter(date =>
      date >= weekStartStr && date <= today
    ).length;

    // 计算本月训练天数
    const monthlyDays = uniqueDates.filter(date =>
      date >= monthStartStr && date <= today
    ).length;

    // 计算连续训练天数
    let continuousDays = 0;
    let currentDate = new Date(today);

    for (const date of uniqueDates) {
      const workoutDate = new Date(date);
      const diffDays = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        continuousDays++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }

    // 计算总训练天数
    const totalDays = uniqueDates.length;

    // 计算几天没有训练
    let withoutWorkoutDays = 0;
    if (uniqueDates.length > 0) {
      const lastWorkoutDate = new Date(uniqueDates[0]);
      const todayDate = new Date(today);
      withoutWorkoutDays = Math.floor((todayDate.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      weeklyDays,
      monthlyDays,
      continuousDays,
      totalDays,
      withoutWorkoutDays
    };
  }

  /**
   * 按周根据category分组获取训练记录
   * @param {QueryWorkoutDto} query - 查询参数
   * @returns {Promise<{ data: Array<{ period: string; periodTotalDays: number; stats: Array<{ category: string; categoryName: string; totalDays: number; totalGroups: number; totalReps: number }> }>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按周根据category分组的训练记录
   */
  async findAllGroupByWeekCategory(query: QueryWorkoutDto): Promise<{
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
    return this.findAllGroupByPeriodCategory(query, {
      dateFormat: 'YYYY-MM-DD',
      periodsToShow: query.pageSize,
      periodUnit: 'week'
    });
  }

  /**
   * 按月根据category分组获取训练记录
   * @param {QueryWorkoutDto} query - 查询参数
   * @returns {Promise<{ data: Array<{ period: string; periodTotalDays: number; stats: Array<{ category: string; categoryName: string; totalDays: number; totalGroups: number; totalReps: number }> }>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按月根据category分组的训练记录
   */
  async findAllGroupByMonthCategory(query: QueryWorkoutDto): Promise<{
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
    return this.findAllGroupByPeriodCategory(query, {
      dateFormat: 'YYYY-MM',
      periodsToShow: query.pageSize,
      periodUnit: 'month'
    });
  }

  /**
   * 按年根据category分组获取训练记录
   * @param {QueryWorkoutDto} query - 查询参数
   * @returns {Promise<{ data: Array<{ period: string; periodTotalDays: number; stats: Array<{ category: string; categoryName: string; totalDays: number; totalGroups: number; totalReps: number }> }>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按年根据category分组的训练记录
   */
  async findAllGroupByYearCategory(query: QueryWorkoutDto): Promise<{
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
    return this.findAllGroupByPeriodCategory(query, {
      dateFormat: 'YYYY',
      periodsToShow: query.pageSize,
      periodUnit: 'year'
    });
  }

  /**
   * 按时间周期根据category分组获取训练记录的通用方法
   * @param {QueryWorkoutDto} query - 查询参数
   * @param {Object} options - 配置选项
   * @param {string} options.dateFormat - 日期格式
   * @param {number} options.periodsToShow - 显示的周期数量
   * @param {'week' | 'month' | 'year'} options.periodUnit - 周期单位
   * @returns {Promise<{ data: Array<{ period: string; periodTotalDays: number; stats: Array<{ category: string; categoryName: string; totalDays: number; totalGroups: number; totalReps: number }> }>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按时间周期根据category分组的训练记录
   */
  private async findAllGroupByPeriodCategory(
    query: QueryWorkoutDto,
    options: {
      dateFormat: string;
      periodsToShow: number;
      periodUnit: 'week' | 'month' | 'year';
    }
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
    // 构建日期范围条件
    const { conditions } = this.buildDateRangeConditions(query, {
      periodUnit: options.periodUnit,
      periodsToShow: options.periodsToShow
    });

    // 获取所有训练记录
    const workouts = await this.workoutModel
      .find(conditions)
      .sort({ date: -1, _id: -1 })
      .exec();

    // 获取项目信息映射
    const projects = await this.projectService.findAll(query.userId);
    const projectMap = new Map<string, { name: string; category: string; seqNo: number }>();

    projects.forEach(project => {
      const projectId = project.id.toString();
      projectMap.set(projectId, {
        name: project.name,
        category: project.category,
        seqNo: project.seqNo
      });
    });

    // 按时间周期分组
    const { startDate } = this.buildDateRangeConditions(query, {
      periodUnit: options.periodUnit,
      periodsToShow: options.periodsToShow
    });

    const groupedByPeriod = this.initializePeriodGroups(query, {
      periodUnit: options.periodUnit,
      periodsToShow: options.periodsToShow,
      dateFormat: options.dateFormat
    }, startDate);

    workouts.forEach(workout => {
      const periodKey = this.generatePeriodKey(workout.date, {
        periodUnit: options.periodUnit,
        dateFormat: options.dateFormat
      });

      if (groupedByPeriod[periodKey]) {
        const projectInfo = projectMap.get(workout.projectId.toString());
        const category = projectInfo?.category || '未知分类';

        if (!groupedByPeriod[periodKey][category]) {
          groupedByPeriod[periodKey][category] = { workouts: [], uniqueDates: new Set() };
        }

        groupedByPeriod[periodKey][category].workouts.push(workout);
        groupedByPeriod[periodKey][category].uniqueDates.add(workout.date);
      }
    });

    // 计算统计数据
    const result: Array<{
      period: string;
      periodTotalDays: number;
      stats: Array<{ category: string; categoryName: string; totalDays: number; totalGroups: number; totalReps: number }>;
    }> = [];

    Object.keys(groupedByPeriod).forEach(period => {
      const periodData = groupedByPeriod[period];
      const allUniqueDates = new Set<string>();

      // 收集该周期内所有唯一日期
      Object.values(periodData).forEach(categoryData => {
        categoryData.uniqueDates.forEach(date => allUniqueDates.add(date));
      });

      const stats: Array<{ category: string; categoryName: string; totalDays: number; totalGroups: number; totalReps: number }> = [];

      Object.keys(periodData).forEach(category => {
        const categoryData = periodData[category];
        let totalGroups = 0;
        let totalReps = 0;

        categoryData.workouts.forEach(workout => {
          workout.groups.forEach(group => {
            totalGroups++;
            totalReps += group.reps;
          });
        });

        // 获取分类名称
        const categoryName = this.getCategoryName(category);

        stats.push({
          category,
          categoryName,
          totalDays: categoryData.uniqueDates.size,
          totalGroups,
          totalReps
        });
      });

      // 按分类名称排序
      stats.sort((a, b) => a.categoryName.localeCompare(b.categoryName));

      result.push({
        period,
        periodTotalDays: allUniqueDates.size,
        stats
      });
    });

    // 按周期排序（最新的在前）
    const sortedResult = this.sortByPeriod(result, { periodUnit: options.periodUnit });

    // 分页处理
    return this.handlePagination(sortedResult, query);
  }

  /**
   * 初始化所有周期的记录
   * @param {QueryWorkoutDto} query - 查询参数
   * @param {Object} options - 配置选项
   * @param {string} options.periodUnit - 周期单位
   * @param {number} options.periodsToShow - 显示的周期数量
   * @param {string} options.dateFormat - 日期格式
   * @param {dayjs.Dayjs} startDate - 开始日期
   * @returns {Record<string, any>} 初始化的周期记录
   */
  private initializePeriodGroups(
    query: QueryWorkoutDto,
    options: {
      periodUnit: 'week' | 'month' | 'year';
      periodsToShow: number;
      dateFormat: string;
    },
    startDate: dayjs.Dayjs
  ): Record<string, Record<string, { workouts: Workout[]; uniqueDates: Set<string> }>> {
    const periodGroups: Record<string, Record<string, { workouts: Workout[]; uniqueDates: Set<string> }>> = {};

    if (options.periodUnit === 'year' && query.date) {
      // 如果是指定年份查询，只初始化该年份
      const yearKey = new Date(query.date).getFullYear().toString();
      periodGroups[yearKey] = {};
    } else {
      // 否则初始化多个周期
      for (let i = 0; i < options.periodsToShow; i++) {
        const periodDate = startDate.add(i, options.periodUnit);
        const periodKey = periodDate.format(options.dateFormat);
        periodGroups[periodKey] = {};
      }
    }

    return periodGroups;
  }

  /**
   * 处理分页逻辑
   * @param {Array} data - 数据数组
   * @param {Object} query - 查询参数
   * @returns {Object} 分页结果
   */
  private handlePagination<T>(
    data: T[],
    query: QueryWorkoutDto
  ): {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  } {
    const { page = 1, pageSize = 10 } = query;
    const total = data.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
      hasMore: endIndex < total
    };
  }

  /**
   * 构建日期范围查询条件
   * @param {QueryWorkoutDto} query - 查询参数
   * @param {Object} options - 配置选项
   * @param {string} options.periodUnit - 周期单位
   * @param {number} options.periodsToShow - 显示的周期数量
   * @returns {Object} 包含 conditions 和 startDate 的对象
   */
  private buildDateRangeConditions(
    query: QueryWorkoutDto,
    options: {
      periodUnit: 'week' | 'month' | 'year';
      periodsToShow: number;
    }
  ): {
    conditions: Record<string, unknown>;
    startDate: dayjs.Dayjs;
  } {
    // 构建查询条件
    const conditions: Record<string, unknown> = { userId: query.userId };
    if (query.projectId) {
      conditions.projectId = query.projectId;
    }

    // 获取当前日期
    const now = dayjs();
    const today = now.format('YYYY-MM-DD');

    // 计算开始日期
    let startDate: dayjs.Dayjs;
    if (options.periodUnit === 'year' && query.date) {
      // 如果是指定年份查询
      const date = new Date(query.date);
      const year = date.getFullYear();
      startDate = dayjs(`${year}-01-01`);
    } else {
      // 如果是周或月查询，或者是默认年份查询
      startDate = options.periodUnit === 'week'
        ? dayjs(now.startOf('isoWeek')).subtract(options.periodsToShow - 1, 'week')
        : options.periodUnit === 'month'
          ? dayjs(now.startOf('month')).subtract(options.periodsToShow - 1, 'month')
          : dayjs(now.startOf('year')).subtract(options.periodsToShow - 1, 'year');
    }

    // 构建日期范围条件
    if (options.periodUnit === 'year' && query.date) {
      const year = new Date(query.date).getFullYear();
      conditions.date = {
        $gte: `${year}-01-01`,
        $lte: `${year}-12-31`
      };
    } else {
      conditions.date = {
        $gte: startDate.format('YYYY-MM-DD'),
        $lte: today
      };
    }

    return { conditions, startDate };
  }

  /**
   * 生成周期键
   * @param {string} date - 日期字符串
   * @param {Object} options - 配置选项
   * @param {string} options.periodUnit - 周期单位
   * @param {string} options.dateFormat - 日期格式
   * @returns {string} 周期键
   */
  private generatePeriodKey(
    date: string,
    options: {
      periodUnit: 'week' | 'month' | 'year';
      dateFormat: string;
    }
  ): string {
    if (options.periodUnit === 'week') {
      return dayjs(date).startOf('isoWeek').format('YYYY-MM-DD');
    } else if (options.periodUnit === 'month') {
      return dayjs(date).format('YYYY-MM');
    } else {
      return dayjs(date).format('YYYY');
    }
  }

  /**
   * 获取分类名称
   * @param {string} category - 分类值
   * @returns {string} 分类名称
   */
  private getCategoryName(category: string): string {
    const categoryOption = CATEGORY_OPTIONS.find(option => option.value === category);
    return categoryOption?.label || category;
  }

  /**
   * 按周期排序（最新的在前）
   * @param {Array} data - 数据数组
   * @param {Object} options - 配置选项
   * @param {string} options.periodUnit - 周期单位
   */
  private sortByPeriod<T extends { period: string }>(
    data: T[],
    options: {
      periodUnit: 'week' | 'month' | 'year';
    }
  ): T[] {
    return data.sort((a, b) => {
      if (options.periodUnit === 'week') {
        return dayjs(b.period, 'YYYY-MM-DD').valueOf() - dayjs(a.period, 'YYYY-MM-DD').valueOf();
      } else if (options.periodUnit === 'month') {
        return dayjs(b.period, 'YYYY-MM').valueOf() - dayjs(a.period, 'YYYY-MM').valueOf();
      } else {
        return dayjs(b.period, 'YYYY').valueOf() - dayjs(a.period, 'YYYY').valueOf();
      }
    });
  }

  /**
   * 按年月获取训练记录列表
   * @param {string} year - 年份
   * @param {string} month - 月份
   * @param {string} userId - 用户ID
   * @returns {Promise<{ data: Record<string, unknown[]>; total: number }>} 按日期分组的训练记录和总数
   */
  async findByYearMonth(year: string, month: string, userId: string): Promise<{ data: Record<string, unknown[]>; total: number }> {
    const workouts = await this.workoutModel
      .find({
        userId,
        date: {
          $gte: `${year}-${month.padStart(2, '0')}-01`,
          $lte: `${year}-${month.padStart(2, '0')}-31`
        }
      })
      .sort({ date: -1 })
      .exec();

    // 按日期分组
    const groupedData: Record<string, unknown[]> = {};
    workouts.forEach(workout => {
      if (!groupedData[workout.date]) {
        groupedData[workout.date] = [];
      }
      groupedData[workout.date].push(workout);
    });

    return {
      data: groupedData,
      total: Object.keys(groupedData).length
    };
  }

}
