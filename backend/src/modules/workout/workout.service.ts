import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Model } from 'mongoose';
import { ProjectService } from '../project/project.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { QueryWorkoutDto } from './dto/query-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { Workout } from './workout.entity';
import { Project } from '../project/project.entity';

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
     * 获取项目名称映射
     * @param {Workout[]} workouts - 训练记录列表
     * @param {string} userId - 用户ID
     * @returns {Promise<Map<string, string>>} 项目ID到项目名称的映射
     */
    private async getProjectNameMap(workouts: Workout[], userId: string): Promise<Map<string, string>> {
        // 获取所有唯一的项目ID
        const projectIds = [...new Set(workouts.map(w => w.projectId.toString()))];

        // 查询项目信息
        const projects = await this.projectService.findAll(userId);

        // 创建映射
        const projectMap = new Map<string, string>();
        projects.forEach(project => {
            projectMap.set(project.id.toString(), project.name);
        });

        return projectMap;
    }

    /**
     * 获取项目排序映射
     * @param {Workout[]} workouts - 训练记录列表
     * @param {string} userId - 用户ID
     * @returns {Promise<Map<string, number>>} 项目ID到项目排序号的映射
     */
    private async getProjectSeqNoMap(workouts: Workout[], userId: string): Promise<Map<string, number>> {
        // 获取所有唯一的项目ID
        const projectIds = [...new Set(workouts.map(w => w.projectId.toString()))];

        // 查询项目信息
        const projects = await this.projectService.findAll(userId);

        // 创建映射
        const projectMap = new Map<string, number>();
        projects.forEach(project => {
            projectMap.set(project.id.toString(), project.seqNo);
        });

        return projectMap;
    }

    /**
     * 计算项目统计信息
     * @param {{ workouts: Workout[]; uniqueDates: Set<string> }} data - 项目训练数据
     * @returns {{ totalGroups: number; totalReps: number; totalDays: number }} 项目统计信息
     */
    private calculateProjectStats(data: { workouts: Workout[]; uniqueDates: Set<string> }): {
        totalGroups: number;
        totalReps: number;
        totalDays: number;
    } {
        // 计算总组数
        const totalGroups = data.workouts.reduce((sum, workout) => sum + workout.groups.length, 0);
        // 计算总次数
        const totalReps = data.workouts.reduce((sum, workout) =>
            sum + workout.groups.reduce((groupSum, group) => groupSum + group.reps, 0), 0);
        // 计算训练天数
        const totalDays = data.uniqueDates.size;

        return {
            totalGroups,
            totalReps,
            totalDays
        };
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
        projectNameMap: Map<string, string>
    ): Array<{ projectName: string; totalGroups: number; totalReps: number; totalDays: number }> {
        // 创建项目名称到ID的映射
        const projectNameToIdMap = new Map<string, string>();
        workouts.forEach(workout => {
            const projectId = workout.projectId.toString();
            const projectName = projectNameMap.get(projectId) || workout.projectName;
            if (!projectNameToIdMap.has(projectName)) {
                projectNameToIdMap.set(projectName, projectId);
            }
        });

        // 添加排序号并排序
        const statsWithSeqNo = stats.map(stat => {
            const projectId = projectNameToIdMap.get(stat.projectName);
            const seqNo = projectId ? projectSeqNoMap.get(projectId) || 0 : 0;
            return { ...stat, seqNo };
        });

        // 按排序号排序
        statsWithSeqNo.sort((a, b) => a.seqNo - b.seqNo);

        // 移除排序号字段
        return statsWithSeqNo.map(({ seqNo, ...rest }) => rest);
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
        const conditions: any = { userId: query.userId };
        if (query.date) {
            conditions.date = query.date;
        }
        if (query.projectName) {
            conditions.projectName = { $regex: query.projectName, $options: 'i' };
        }

        try {
            // 1. 首先获取所有唯一的日期
            const uniqueDates = await this.workoutModel
                .distinct('date', conditions)
                .exec();

            // 对日期进行排序（在内存中进行）
            uniqueDates.sort((a, b) => b.localeCompare(a));

            // 2. 计算分页
            const startIndex = (query.page - 1) * query.pageSize;
            const endIndex = startIndex + query.pageSize;
            const paginatedDates = uniqueDates.slice(startIndex, endIndex);

            // 3. 获取这些日期对应的所有记录
            const workouts = await this.workoutModel
                .find({
                    ...conditions,
                    date: { $in: paginatedDates }
                })
                .sort({ date: -1, _id: -1 })
                .exec();

            // 4. 获取项目名称映射和排序映射
            const [projectNameMap, projectSeqNoMap] = await Promise.all([
                this.getProjectNameMap(workouts, query.userId),
                this.getProjectSeqNoMap(workouts, query.userId)
            ]);

            // 5. 按日期分组，并设置项目名称
            const groupedWorkouts = workouts.reduce((acc, workout) => {
                if (!acc[workout.date]) {
                    acc[workout.date] = [];
                }
                // 设置项目名称
                workout.projectName = projectNameMap.get(workout.projectId.toString()) || workout.projectName;
                acc[workout.date].push(workout);
                return acc;
            }, {} as Record<string, Workout[]>);

            // 6. 对每个日期的训练记录按项目排序号排序
            Object.keys(groupedWorkouts).forEach(date => {
                groupedWorkouts[date].sort((a, b) => {
                    const seqNoA = projectSeqNoMap.get(a.projectId.toString()) || 0;
                    const seqNoB = projectSeqNoMap.get(b.projectId.toString()) || 0;
                    return seqNoA - seqNoB;
                });
            });

            // 7. 计算总数和是否有更多数据
            const total = uniqueDates.length;
            const hasMore = total > endIndex;

            return {
                data: groupedWorkouts,
                total,
                page: query.page,
                pageSize: query.pageSize,
                hasMore,
            };
        } catch (error) {
            console.error('Error in findAllGroupByDate:', error);
            throw error;
        }
    }

    /**
     * 按周分组获取训练记录
     * @param {QueryWorkoutDto} query - 查询参数
     * @returns {Promise<{ data: Record<string, { projectName: string; totalGroups: number; totalReps: number; totalDays: number }[]>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按周分组的训练记录和分页信息
     */
    async findAllGroupByWeek(query: QueryWorkoutDto): Promise<{
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
        // 构建查询条件
        const conditions: any = { userId: query.userId };
        if (query.projectName) {
            conditions.projectName = { $regex: query.projectName, $options: 'i' };
        }

        try {
            // 获取当前日期
            const now = dayjs();
            const today = now.format('YYYY-MM-DD');

            // 计算往前推的周数
            const weeksToShow = query.pageSize;
            const startWeek = now.startOf('isoWeek').format('YYYY-MM-DD');
            const startDate = dayjs(startWeek).subtract(weeksToShow - 1, 'week');

            // 构建日期范围条件
            conditions.date = {
                $gte: startDate.format('YYYY-MM-DD'),
                $lte: today
            };

            // 1. 获取所有训练记录
            const workouts = await this.workoutModel
                .find(conditions)
                .sort({ date: -1, _id: -1 })
                .exec();

            // 2. 获取项目名称映射和排序映射
            const [projectNameMap, projectSeqNoMap] = await Promise.all([
                this.getProjectNameMap(workouts, query.userId),
                this.getProjectSeqNoMap(workouts, query.userId)
            ]);

            // 3. 按周和项目分组
            const weekGroups: Record<string, Record<string, {
                workouts: Workout[];
                uniqueDates: Set<string>;
            }>> = {};

            // 初始化所有周的记录
            for (let i = 0; i < weeksToShow; i++) {
                const weekDate = startDate.add(i, 'week');
                const weekKey = weekDate.format('YYYY-MM-DD');
                weekGroups[weekKey] = {};
            }

            // 填充训练记录
            workouts.forEach(workout => {
                const weekKey = dayjs(workout.date).startOf('isoWeek').format('YYYY-MM-DD');
                const projectName = projectNameMap.get(workout.projectId.toString()) || workout.projectName;
                if (!weekGroups[weekKey][projectName]) {
                    weekGroups[weekKey][projectName] = {
                        workouts: [],
                        uniqueDates: new Set()
                    };
                }
                weekGroups[weekKey][projectName].workouts.push(workout);
                weekGroups[weekKey][projectName].uniqueDates.add(workout.date);
            });

            // 4. 获取所有周的唯一键并排序
            const uniqueWeeks = Object.keys(weekGroups).sort((a, b) => b.localeCompare(a));

            // 5. 构建分页后的数据，计算每周每个项目的统计信息
            const paginatedData: Record<string, {
                projectName: string;
                totalGroups: number;
                totalReps: number;
                totalDays: number;
            }[]> = {};

            uniqueWeeks.forEach(week => {
                const weekStats = Object.entries(weekGroups[week]).map(([projectName, data]) => ({
                    projectName,
                    ...this.calculateProjectStats(data)
                }));

                // 使用通用排序方法
                paginatedData[week] = this.sortStatsByProjectSeqNo(weekStats, workouts, projectSeqNoMap, projectNameMap);
            });

            // 6. 计算总数和是否有更多数据
            const total = uniqueWeeks.length;
            const hasMore = false; // 由于我们总是显示固定数量的周，所以这里总是返回 false

            return {
                data: paginatedData,
                total,
                page: query.page,
                pageSize: query.pageSize,
                hasMore,
            };
        } catch (error) {
            throw error;
        }
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
        const [projectNameMap, projectSeqNoMap] = await Promise.all([
            this.getProjectNameMap(workouts, userId),
            this.getProjectSeqNoMap(workouts, userId)
        ]);

        // 按日期分组，并设置项目名称
        const groupedWorkouts = workouts.reduce((acc, workout) => {
            if (!acc[workout.date]) {
                acc[workout.date] = [];
            }
            // 设置项目名称
            workout.projectName = projectNameMap.get(workout.projectId.toString()) || workout.projectName;
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
            const sortedStats = this.sortStatsByProjectSeqNo(dateStats, workouts, projectSeqNoMap, projectNameMap);

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
     * 获取按天分组的训练记录
     * @param {QueryWorkoutDto} query - 查询参数
     * @returns {Promise<{ data: Record<string, Workout[]>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按天分组的训练记录和分页信息
     */
    async findAllGroupByDay(query: QueryWorkoutDto): Promise<{
        data: Record<string, Workout[]>;
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
    }> {
        // 构建查询条件
        const conditions: any = { userId: query.userId };
        if (query.date) {
            conditions.date = query.date;
        }
        if (query.projectName) {
            conditions.projectName = query.projectName;
        }

        try {
            // 1. 获取所有训练记录
            const workouts = await this.workoutModel
                .find(conditions)
                .sort({ date: -1, _id: -1 })
                .exec();

            // 2. 获取项目名称映射和排序映射
            const [projectNameMap, projectSeqNoMap] = await Promise.all([
                this.getProjectNameMap(workouts, query.userId),
                this.getProjectSeqNoMap(workouts, query.userId)
            ]);

            // 3. 按日期分组
            const groupedWorkouts = workouts.reduce((acc, workout) => {
                if (!acc[workout.date]) {
                    acc[workout.date] = [];
                }
                // 设置项目名称
                workout.projectName = projectNameMap.get(workout.projectId.toString()) || workout.projectName;
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
                const dateStats = groupedWorkouts[date].map(workout => ({
                    projectName: workout.projectName,
                    totalGroups: workout.groups.length,
                    totalReps: workout.groups.reduce((sum, group) => sum + group.reps, 0),
                    totalDays: 1
                }));

                // 使用通用排序方法
                const sortedStats = this.sortStatsByProjectSeqNo(dateStats, workouts, projectSeqNoMap, projectNameMap);

                // 更新排序后的训练记录
                paginatedData[date] = sortedStats.map(stat =>
                    groupedWorkouts[date].find(w => w.projectName === stat.projectName)
                ).filter(Boolean) as Workout[];
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
        } catch (error) {
            throw error;
        }
    }

    /**
     * 获取按月分组的训练记录
     * @param {QueryWorkoutDto} query - 查询参数
     * @returns {Promise<{ data: Record<string, { projectName: string; totalGroups: number; totalReps: number; totalDays: number }[]>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按月分组的训练记录和分页信息
     */
    async findAllGroupByMonth(query: QueryWorkoutDto): Promise<{
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
        // 构建查询条件
        const conditions: any = { userId: query.userId };
        if (query.projectName) {
            conditions.projectName = { $regex: query.projectName, $options: 'i' };
        }

        try {
            // 获取当前日期
            const now = new Date();
            const today = now.toISOString().split('T')[0];

            // 计算往前推的月数
            const monthsToShow = query.pageSize;
            const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endMonth = new Date(now.getFullYear(), now.getMonth() - (monthsToShow - 1), 1);

            // 构建日期范围条件
            conditions.date = {
                $gte: endMonth.toISOString().split('T')[0],
                $lte: today
            };

            // 1. 获取所有训练记录
            const workouts = await this.workoutModel
                .find(conditions)
                .sort({ date: -1, _id: -1 })
                .exec();

            // 2. 获取项目名称映射和排序映射
            const [projectNameMap, projectSeqNoMap] = await Promise.all([
                this.getProjectNameMap(workouts, query.userId),
                this.getProjectSeqNoMap(workouts, query.userId)
            ]);

            // 3. 按月和项目分组
            const monthGroups: Record<string, Record<string, {
                workouts: Workout[];
                uniqueDates: Set<string>;
            }>> = {};

            // 初始化所有月的记录
            for (let i = 0; i < monthsToShow; i++) {
                const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthKey = `${monthDate.getFullYear()}-${(monthDate.getMonth() + 1).toString().padStart(2, '0')}`;
                monthGroups[monthKey] = {};
            }

            // 填充训练记录
            workouts.forEach(workout => {
                const date = new Date(workout.date);
                const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                const projectName = projectNameMap.get(workout.projectId.toString()) || workout.projectName;

                if (!monthGroups[monthKey][projectName]) {
                    monthGroups[monthKey][projectName] = {
                        workouts: [],
                        uniqueDates: new Set()
                    };
                }
                monthGroups[monthKey][projectName].workouts.push(workout);
                monthGroups[monthKey][projectName].uniqueDates.add(workout.date);
            });

            // 4. 获取所有月份的唯一键并排序
            const uniqueMonths = Object.keys(monthGroups).sort((a, b) => b.localeCompare(a));

            // 5. 构建分页后的数据，计算每月每个项目的统计信息
            const paginatedData: Record<string, {
                projectName: string;
                totalGroups: number;
                totalReps: number;
                totalDays: number;
            }[]> = {};

            uniqueMonths.forEach(month => {
                const monthStats = Object.entries(monthGroups[month]).map(([projectName, data]) => ({
                    projectName,
                    ...this.calculateProjectStats(data)
                }));

                // 使用通用排序方法
                paginatedData[month] = this.sortStatsByProjectSeqNo(monthStats, workouts, projectSeqNoMap, projectNameMap);
            });

            // 6. 计算总数和是否有更多数据
            const total = uniqueMonths.length;
            const hasMore = false; // 由于我们总是显示固定数量的月，所以这里总是返回 false

            return {
                data: paginatedData,
                total,
                page: query.page,
                pageSize: query.pageSize,
                hasMore,
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * 获取按年分组的训练记录
     * @param {QueryWorkoutDto} query - 查询参数
     * @returns {Promise<{ data: Record<string, { projectName: string; totalGroups: number; totalReps: number; totalDays: number }[]>; total: number; page: number; pageSize: number; hasMore: boolean }>} 按年分组的训练记录和分页信息
     */
    async findAllGroupByYear(query: QueryWorkoutDto): Promise<{
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
        // 构建查询条件
        const conditions: any = { userId: query.userId };
        if (query.date) {
            const date = new Date(query.date);
            const year = date.getFullYear();
            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;
            conditions.date = { $gte: startDate, $lte: endDate };
        }
        if (query.projectName) {
            conditions.projectName = query.projectName;
        }

        try {
            // 1. 获取所有训练记录
            const workouts = await this.workoutModel
                .find(conditions)
                .sort({ date: -1, _id: -1 })
                .exec();

            // 2. 获取项目名称映射和排序映射
            const [projectNameMap, projectSeqNoMap] = await Promise.all([
                this.getProjectNameMap(workouts, query.userId),
                this.getProjectSeqNoMap(workouts, query.userId)
            ]);

            // 3. 按年和项目分组
            const yearGroups: Record<string, Record<string, {
                workouts: Workout[];
                uniqueDates: Set<string>;
            }>> = {};

            workouts.forEach(workout => {
                const date = new Date(workout.date);
                const yearKey = date.getFullYear().toString();
                const projectName = projectNameMap.get(workout.projectId.toString()) || workout.projectName;

                if (!yearGroups[yearKey]) {
                    yearGroups[yearKey] = {};
                }
                if (!yearGroups[yearKey][projectName]) {
                    yearGroups[yearKey][projectName] = {
                        workouts: [],
                        uniqueDates: new Set()
                    };
                }
                yearGroups[yearKey][projectName].workouts.push(workout);
                yearGroups[yearKey][projectName].uniqueDates.add(workout.date);
            });

            // 4. 获取所有年份的唯一键并排序
            const uniqueYears = Object.keys(yearGroups).sort((a, b) => b.localeCompare(a));

            // 5. 计算分页
            const startIndex = (query.page - 1) * query.pageSize;
            const endIndex = startIndex + query.pageSize;
            const paginatedYears = uniqueYears.slice(startIndex, endIndex);

            // 6. 构建分页后的数据，计算每年每个项目的统计信息
            const paginatedData: Record<string, {
                projectName: string;
                totalGroups: number;
                totalReps: number;
                totalDays: number;
            }[]> = {};

            paginatedYears.forEach(year => {
                const yearStats = Object.entries(yearGroups[year]).map(([projectName, data]) => ({
                    projectName,
                    ...this.calculateProjectStats(data)
                }));

                // 使用通用排序方法
                paginatedData[year] = this.sortStatsByProjectSeqNo(yearStats, workouts, projectSeqNoMap, projectNameMap);
            });

            // 7. 计算总数和是否有更多数据
            const total = uniqueYears.length;
            const hasMore = total > endIndex;

            return {
                data: paginatedData,
                total,
                page: query.page,
                pageSize: query.pageSize,
                hasMore,
            };
        } catch (error) {
            throw error;
        }
    }
}
