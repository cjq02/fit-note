import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Workout } from '../workout/workout.entity';
import { WorkoutService } from '../workout/workout.service';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectDocument } from './project.entity';


// 扩展 Workout 类型，添加 id 字段
type WorkoutWithId = Workout & { id: string };

@Injectable()
export class ProjectService {
  constructor(
        @InjectModel(Project.name)
        private projectModel: Model<ProjectDocument>,
        @Inject(forwardRef(() => WorkoutService))
        private workoutService: WorkoutService,
  ) { }

  // 获取所有训练项目
  // @param {string} userId - 用户ID
  // @returns {Promise<Project[]>} 返回所有训练项目，每个项目包含当天的训练记录ID（如果存在）
  async findAll(userId: string): Promise<(Project & { latestWorkoutId?: string, latestWorkoutDate?: string })[]> {
    // 获取当前用户的所有项目
    const projects = await this.projectModel.find({ userId }).sort({ seqNo: 1, createdAt: -1 }).exec();

    // 为每个项目查询今天的训练记录和最近训练日期
    const projectsWithWorkout = await Promise.all(
      projects.map(async (project) => {
        const latestWorkout = await this.workoutService.findLatestByProject(
          project._id.toString(),
          userId
        ) as WorkoutWithId | null;
        // 判断是否为今天的训练
        const latestWorkoutId = latestWorkout ? latestWorkout.id : undefined;
        return {
          ...project.toObject(),
          latestWorkoutId,
          latestWorkoutDate: latestWorkout?.date || null,
        };
      })
    );

    return projectsWithWorkout;
  }

  // 获取单个训练项目
  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException('训练项目不存在');
    }
    return project;
  }

  // 创建训练项目
  /**
     * 创建新的训练项目
     * @param {CreateProjectDto} createProjectDto - 创建项目的数据
     * @param {string} userId - 用户ID
     * @returns {Promise<Project>} 创建的项目
     */
  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    try {
      const project = new this.projectModel({
        ...createProjectDto,
        userId,
      });
      return await project.save();
    } catch (error) {
      if (error.code === 11000) {
        console.error('训练项目名称已存在，尝试保存的数据：', { ...createProjectDto, userId });
        const exist = await this.projectModel.findOne({ name: createProjectDto.name, userId });
        if (exist) {
          console.error('已存在的项目：', exist);
        }
        throw new ConflictException('训练项目名称已存在');
      }
      throw error;
    }
  }

  // 更新训练项目
  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    try {
      const updateData = {
        ...updateProjectDto,
      };
      const project = await this.projectModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .exec();
      if (!project) {
        throw new NotFoundException('训练项目不存在');
      }
      return project;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('训练项目名称已存在');
      }
      throw error;
    }
  }

  // 删除训练项目
  async remove(id: string): Promise<void> {
    const project = await this.projectModel.findByIdAndDelete(id).exec();
    if (!project) {
      throw new NotFoundException('训练项目不存在');
    }
  }
}
