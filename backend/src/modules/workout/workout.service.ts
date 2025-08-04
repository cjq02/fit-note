import { CATEGORY_OPTIONS } from '@fit-note/shared-utils/dict.options';
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

// 扩展的训练记录类型，包含分类信息
interface WorkoutWithCategory extends Workout {
  category: string;
}

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
    // 关联获取项目名称
    const project = await this.projectService.findOne(workout.projectId.toString());
    workout.projectName = project.name;
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
  async getProjectMaps(workouts: Workout[], userId: string): Promise<{
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
    // 新增：支持 category 参数
    else if (query.category) {
      // 先查出该用户下所有该类别的项目id
      const projects = await this.projectService.findAll(query.userId);
      const categoryProjectIds = projects.filter(p => p.category === query.category).map(p => p.id.toString());
      if (categoryProjectIds.length === 0) {
        // 没有该类别的项目，直接返回空
        return {
          data: {},
          total: 0,
          page: query.page,
          pageSize: query.pageSize,
          hasMore: false
        };
      }
      conditions.projectId = { $in: categoryProjectIds };
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
   * 按年月获取训练记录
   * @param {string} year - 年份
   * @param {string} month - 月份
   * @param {string} userId - 用户ID
   * @returns {Promise<{ data: Record<string, WorkoutWithCategory[]>; total: number }>} 按日期分组的训练记录和总数
   * @throws {BadRequestException} 当年月参数无效时抛出异常
   */
  async findByYearMonth(year: string, month: string, userId: string): Promise<{
    data: Record<string, WorkoutWithCategory[]>;
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

    // 获取项目信息映射
    const projects = await this.projectService.findAll(userId);
    const projectMap = new Map<string, { name: string; category: string; seqNo: number }>();

    projects.forEach(project => {
      const projectId = project.id.toString();
      projectMap.set(projectId, {
        name: project.name,
        category: project.category,
        seqNo: project.seqNo
      });
    });

    // 按日期分组，并设置项目名称和分类
    const groupedWorkouts = workouts.reduce((acc, workout) => {
      if (!acc[workout.date]) {
        acc[workout.date] = [];
      }

      // 获取项目信息
      const projectInfo = projectMap.get(workout.projectId.toString());
      if (projectInfo) {
        workout.projectName = projectInfo.name;
      }

      // 创建扩展的训练记录对象，包含分类信息
      const workoutWithCategory: WorkoutWithCategory = {
        ...workout.toObject(),
        category: projectInfo?.category || '未知分类'
      };

      acc[workout.date].push(workoutWithCategory);
      return acc;
    }, {} as Record<string, WorkoutWithCategory[]>);

    // 对每个日期的训练记录按项目排序号排序
    Object.keys(groupedWorkouts).forEach(date => {
      groupedWorkouts[date].sort((a, b) => {
        const projectA = projectMap.get(a.projectId.toString());
        const projectB = projectMap.get(b.projectId.toString());
        const seqNoA = projectA?.seqNo || 0;
        const seqNoB = projectB?.seqNo || 0;
        return seqNoA - seqNoB;
      });
    });

    return {
      data: groupedWorkouts,
      total: workouts.length
    };
  }

  // 查找某项目最近一次训练
  async findLatestByProject(projectId: string, userId: string): Promise<Workout | null> {
    const result = await this.workoutModel.findOne({
      projectId,
      userId
    }).sort({ date: -1 }).exec();
    return result;
  }

}
