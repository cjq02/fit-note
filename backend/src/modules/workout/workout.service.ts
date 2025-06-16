import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Model } from 'mongoose';

import type { Project as _Project } from '../project/project.entity';
import { ProjectService } from '../project/project.service';

import { CreateWorkoutDto } from './dto/create-workout.dto';
import { QueryWorkoutDto } from './dto/query-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { Workout } from './workout.entity';

dayjs.extend(isoWeek);

@Injectable()
export class WorkoutService {
  constructor(
        @InjectModel(Workout.name)
        private workoutModel: Model<Workout>,
        @Inject(forwardRef(() => ProjectService))
        private projectService: ProjectService,
  ) { }

  // 获取所有训练记录
  async findAll(userId: string): Promise<Workout[]> {
    return this.workoutModel.find({ userId }).sort({ date: -1 }).exec();
  }

  // 获取单个训练记录
  async findOne(id: string, userId: string): Promise<Workout> {
    const workout = await this.workoutModel.findOne({ _id: id, userId }).exec();
    if (!workout) {
      throw new NotFoundException('训练记录不存在');
    }
    return workout;
  }

  // 创建训练记录
  // @param {CreateWorkoutDto} createWorkoutDto - 创建训练记录的数据
  // @param {string} userId - 用户ID
  // @returns {Promise<Workout>} 创建的训练记录
  async create(createWorkoutDto: CreateWorkoutDto, userId: string): Promise<Workout> {
    // 验证训练项目是否存在
    await this.projectService.findOne(createWorkoutDto.projectId);

    const workout = new this.workoutModel({
      ...createWorkoutDto,
      projectId: createWorkoutDto.projectId,
      userId,
    });
    return await workout.save();
  }

  // 更新训练记录
  async update(id: string, updateWorkoutDto: UpdateWorkoutDto, userId: string): Promise<Workout> {
    if (updateWorkoutDto.projectId) {
      // 验证训练项目是否存在
      await this.projectService.findOne(updateWorkoutDto.projectId);
    }

    const workout = await this.workoutModel.findOneAndUpdate(
      { _id: id, userId },
      updateWorkoutDto,
      { new: true }
    ).exec();

    if (!workout) {
      throw new NotFoundException('训练记录不存在');
    }

    return workout;
  }

  // 删除训练记录
  async remove(id: string, userId: string): Promise<void> {
    const result = await this.workoutModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('训练记录不存在');
    }
  }

  // 根据日期和项目ID查询训练记录
  async findByDateAndProject(date: string, projectId: string, userId: string): Promise<Workout | null> {
    return this.workoutModel.findOne({
      date,
      projectId,
      userId
    }).exec();
  }

  /**
   * 获取项目映射信息
   * @param {Workout[]} workouts - 训练记录列表
   * @param {string} userId - 用户ID
   * @returns {Promise<{ nameMap: Map<string, string>; seqNoMap: Map<string, number> }>} 项目ID到项目名称和排序号的映射
   */
  private async getProjectMaps(workouts: Workout[], userId: string): Promise<{
    nameMap: Map<string, string>;
    seqNoMap: Map<string, number>;
  }> {
    // 查询项目信息
    const projects = await this.projectService.findAll(userId);

    // 创建项目ID到名称和排序号的映射
    const nameMap = new Map<string, string>();
    const seqNoMap = new Map<string, number>();

    projects.forEach(project => {
      const projectId = project.id.toString();
      nameMap.set(projectId, project.name);
      seqNoMap.set(projectId, project.seqNo);
    });

    return { nameMap, seqNoMap };
  }

  /**
     * 按项目排序号对统计数据进行排序
     * @param {Array<{ projectName: string; totalGroups: number; totalReps: number; totalDays: number }>} stats - 统计数据
     * @param {Workout[]} workouts - 训练记录列表
     * @param {Map<string, number>} projectSeqNoMap - 项目排序号映射
     * @param {Map<string, string>} projectNameMap - 项目ID到项目名称的映射
     * @returns {Array<{ projectName: string; totalGroups: number; totalReps: number; totalDays: number }>} 排序后的统计数据
     */
  private sortStatsByProjectSeqNo(
    stats: Array<{ projectName: string; totalGroups: number; totalReps: number; totalDays: number }>,
    workouts: Workout[],
    projectSeqNoMap: Map<string, number>,
    _projectNameMap: Map<string, string>
  ): Array<{ projectName: string; totalGroups: number; totalReps: number; totalDays: number }> {
    // 添加排序号
    const statsWithSeqNo = stats.map(stat => {
      const project = workouts.find(w => w.projectName === stat.projectName);
      const seqNo = project ? projectSeqNoMap.get(project.projectId.toString()) || 0 : 0;
      return { ...stat, seqNo };
    });

    // 按排序号排序
    statsWithSeqNo.sort((a, b) => a.seqNo - b.seqNo);

    // 移除排序号字段
    return statsWithSeqNo.map(({ seqNo: _seqNo, ...rest }) => rest);
  }

  /**
     * 按日期分组获取训练记录
     * @param {QueryWorkoutDto} query - 查询参数
     * @returns {Promise<{ data: Record<string, Workout[]>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按日期分组的训练记录和分页信息
     */
  async findAllGroupByDate(query: QueryWorkoutDto): Promise<{
        data: Record<string, Workout[]>;
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
    }> {
    // 构建查询条件
    const conditions: Record<string, unknown> = { userId: query.userId };
    if (query.date) {
      conditions.date = query.date;
    }
    if (query.projectId) {
      conditions.projectId = query.projectId;
    }

    // 1. 获取所有训练记录
    const workouts = await this.workoutModel
      .find(conditions)
      .sort({ date: -1, _id: -1 })
      .exec();

    // 2. 获取项目名称映射
    const { nameMap } = await this.getProjectMaps(workouts, query.userId);

    // 3. 按日期分组
    const groupedWorkouts = workouts.reduce((acc, workout) => {
      if (!acc[workout.date]) {
        acc[workout.date] = [];
      }
      // 设置项目名称
      workout.projectName = nameMap.get(workout.projectId.toString()) || workout.projectName;
      acc[workout.date].push(workout);
      return acc;
    }, {} as Record<string, Workout[]>);

    // 4. 获取所有日期的唯一键并排序
    const uniqueDates = Object.keys(groupedWorkouts).sort((a, b) => b.localeCompare(a));

    // 5. 计算分页
    const startIndex = (query.page - 1) * query.pageSize;
    const endIndex = startIndex + query.pageSize;
    const paginatedDates = uniqueDates.slice(startIndex, endIndex);

    // 6. 构建分页后的数据
    const paginatedData: Record<string, Workout[]> = {};
    paginatedDates.forEach(date => {
      paginatedData[date] = groupedWorkouts[date];
    });

    // 7. 计算总数和是否有更多数据
    const total = uniqueDates.length;
    const hasMore = total > endIndex;

    return {
      data: paginatedData,
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore,
    };
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

    // 1. 获取所有训练记录
    const workouts = await this.workoutModel
      .find(conditions)
      .sort({ date: -1, _id: -1 })
      .exec();

    // 2. 获取项目名称映射和排序映射
    const { nameMap, seqNoMap } = await this.getProjectMaps(workouts, query.userId);

    // 3. 按周期和项目分组
    const periodGroups: Record<string, Record<string, {
      workouts: Workout[];
      uniqueDates: Set<string>;
    }>> = {};

    // 初始化所有周期的记录
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

    // 4. 填充数据
    workouts.forEach(workout => {
      const periodKey = options.periodUnit === 'week'
        ? dayjs(workout.date).startOf('isoWeek').format(options.dateFormat)
        : options.periodUnit === 'year'
          ? dayjs(workout.date).format('YYYY')
          : dayjs(workout.date).format(options.dateFormat);

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

    // 6. 计算总数和是否有更多数据
    const total = Object.keys(result).length;
    const hasMore = total > query.pageSize;

    // 7. 转换为列表格式
    const data = Object.entries(result).map(([period, stats]) => ({
      period,
      stats
    }));

    return {
      data,
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore,
    };
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
   * 按年月获取训练记录
   * @param {string} year - 年份
   * @param {string} month - 月份
   * @param {string} userId - 用户ID
   * @returns {Promise<{ data: Record<string, Workout[]>; total: number }>} 按日期分组的训练记录和总数
   * @throws {BadRequestException} 当年月参数无效时抛出异常
   */
  async findByYearMonth(year: string, month: string, userId: string): Promise<{
    data: Record<string, Workout[]>;
    total: number;
  }> {
    // 验证参数
    if (!year || !month) {
      throw new BadRequestException('年份和月份不能为空');
    }

    // 验证年份格式
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      throw new BadRequestException('无效的年份');
    }

    // 验证月份格式
    const monthNum = parseInt(month);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new BadRequestException('无效的月份');
    }

    // 构建日期范围
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    const endDate = `${year}-${month.padStart(2, '0')}-${lastDay}`;

    // 查询指定日期范围内的所有记录
    const workouts = await this.workoutModel
      .find({
        date: {
          $gte: startDate,
          $lte: endDate
        },
        userId
      })
      .sort({ date: -1, _id: -1 })
      .exec();

    // 获取项目名称映射和排序映射
    const { nameMap, seqNoMap } = await this.getProjectMaps(workouts, userId);

    // 按日期分组，并设置项目名称
    const groupedWorkouts = workouts.reduce((acc, workout) => {
      if (!acc[workout.date]) {
        acc[workout.date] = [];
      }
      // 设置项目名称
      workout.projectName = nameMap.get(workout.projectId.toString()) || workout.projectName;
      acc[workout.date].push(workout);
      return acc;
    }, {} as Record<string, Workout[]>);

    // 对每个日期的训练记录按项目排序号排序
    Object.keys(groupedWorkouts).forEach(date => {
      const dateStats = groupedWorkouts[date].map(workout => ({
        projectName: workout.projectName,
        totalGroups: workout.groups.length,
        totalReps: workout.groups.reduce((sum, group) => sum + group.reps, 0),
        totalDays: 1
      }));

      // 使用通用排序方法
      const sortedStats = this.sortStatsByProjectSeqNo(dateStats, workouts, seqNoMap, nameMap);

      // 更新排序后的训练记录
      groupedWorkouts[date] = sortedStats.map(stat =>
        groupedWorkouts[date].find(w => w.projectName === stat.projectName)
      ).filter(Boolean) as Workout[];
    });

    return {
      data: groupedWorkouts,
      total: workouts.length
    };
  }
}
