import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Workout, WorkoutDocument } from './workout.entity';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
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
    async findAll(): Promise<Workout[]> {
        return this.workoutModel.find().sort({ date: -1 }).exec();
    }

    // 获取单个训练记录
    async findOne(id: string): Promise<Workout> {
        const workout = await this.workoutModel.findById(id).exec();
        if (!workout) {
            throw new NotFoundException('训练记录不存在');
        }
        return workout;
    }

    // 创建训练记录
    async create(createWorkoutDto: CreateWorkoutDto): Promise<Workout> {
        // 验证训练项目是否存在
        await this.projectService.findOne(createWorkoutDto.projectId);

        const workout = new this.workoutModel({
            ...createWorkoutDto,
            projectId: createWorkoutDto.projectId,
        });
        return await workout.save();
    }

    // 更新训练记录
    async update(id: string, updateWorkoutDto: UpdateWorkoutDto): Promise<Workout> {
        if (updateWorkoutDto.projectId) {
            // 验证训练项目是否存在
            await this.projectService.findOne(updateWorkoutDto.projectId);
        }

        const workout = await this.workoutModel.findByIdAndUpdate(
            id,
            updateWorkoutDto,
            { new: true }
        ).exec();

        if (!workout) {
            throw new NotFoundException('训练记录不存在');
        }

        return workout;
    }

    // 删除训练记录
    async remove(id: string): Promise<void> {
        const result = await this.workoutModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException('训练记录不存在');
        }
    }

    // 根据日期和项目ID查询训练记录
    async findByDateAndProject(date: string, projectId: string): Promise<Workout | null> {
        return this.workoutModel.findOne({
            date,
            projectId,
        }).exec();
    }

    /**
     * 按日期分组获取训练记录
     * @returns {Promise<Record<string, Workout[]>>} 按日期分组的训练记录
     */
    async findAllGroupByDate(): Promise<Record<string, Workout[]>> {
        const workouts = await this.workoutModel.find().sort({ date: -1 }).exec();
        return workouts.reduce((acc, workout) => {
            if (!acc[workout.date]) {
                acc[workout.date] = [];
            }
            acc[workout.date].push(workout);
            return acc;
        }, {} as Record<string, Workout[]>);
    }
}
