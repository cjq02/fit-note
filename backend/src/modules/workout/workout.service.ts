import { Injectable, NotFoundException } from '@nestjs/common';
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
        private projectService: ProjectService,
    ) { }

    // 获取训练记录列表
    async findAll(): Promise<Workout[]> {
        return this.workoutModel
            .find()
            .populate('project')
            .sort({ createdAt: -1 })
            .exec();
    }

    // 获取训练记录详情
    async findOne(id: string): Promise<Workout> {
        const workout = await this.workoutModel
            .findById(id)
            .populate('project')
            .exec();
        if (!workout) {
            throw new NotFoundException('训练记录不存在');
        }
        return workout;
    }

    // 创建训练记录
    async create(createWorkoutDto: CreateWorkoutDto): Promise<Workout> {
        // 验证训练项目是否存在
        await this.projectService.findOne(createWorkoutDto.projectId);

        const workout = new this.workoutModel(createWorkoutDto);
        return await workout.save();
    }

    // 更新训练记录
    async update(id: string, updateWorkoutDto: UpdateWorkoutDto): Promise<Workout> {
        // 如果更新了训练项目，验证新项目是否存在
        if (updateWorkoutDto.projectId) {
            await this.projectService.findOne(updateWorkoutDto.projectId);
        }

        const workout = await this.workoutModel
            .findByIdAndUpdate(id, updateWorkoutDto, { new: true })
            .populate('project')
            .exec();
        if (!workout) {
            throw new NotFoundException('训练记录不存在');
        }
        return workout;
    }

    // 删除训练记录
    async remove(id: string): Promise<void> {
        const workout = await this.workoutModel.findByIdAndDelete(id).exec();
        if (!workout) {
            throw new NotFoundException('训练记录不存在');
        }
    }
} 