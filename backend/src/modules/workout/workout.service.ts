import { Injectable, NotFoundException, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Workout, WorkoutDocument } from './workout.entity';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { QueryWorkoutDto } from './dto/query-workout.dto';
import { ProjectService } from '../project/project.service';

@Injectable()
export class WorkoutService {
    constructor(
        @InjectModel(Workout.name)
        private workoutModel: Model<WorkoutDocument>,
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
        if (query.project) {
            conditions.project = { $regex: query.project, $options: 'i' };
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

            // 4. 按日期分组
            const groupedWorkouts = workouts.reduce((acc, workout) => {
                if (!acc[workout.date]) {
                    acc[workout.date] = [];
                }
                acc[workout.date].push(workout);
                return acc;
            }, {} as Record<string, Workout[]>);

            // 5. 计算总数和是否有更多数据
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

        // 按日期分组
        const groupedWorkouts = workouts.reduce((acc, workout) => {
            if (!acc[workout.date]) {
                acc[workout.date] = [];
            }
            acc[workout.date].push(workout);
            return acc;
        }, {} as Record<string, Workout[]>);

        return {
            data: groupedWorkouts,
            total: workouts.length
        };
    }
}
