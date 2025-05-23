import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Project, ProjectDocument } from './project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
    constructor(
        @InjectModel(Project.name)
        private projectModel: Model<ProjectDocument>,
    ) { }

    // 获取训练项目列表
    async findAll(): Promise<Project[]> {
        return this.projectModel.find().sort({ createdAt: -1 }).exec();
    }

    // 获取训练项目详情
    async findOne(id: string): Promise<Project> {
        const project = await this.projectModel.findById(id).exec();
        if (!project) {
            throw new NotFoundException('训练项目不存在');
        }
        return project;
    }

    // 创建训练项目
    async create(createProjectDto: CreateProjectDto): Promise<Project> {
        try {
            const project = new this.projectModel(createProjectDto);
            return await project.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('训练项目名称已存在');
            }
            throw error;
        }
    }

    // 更新训练项目
    async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
        try {
            const project = await this.projectModel
                .findByIdAndUpdate(id, updateProjectDto, { new: true })
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