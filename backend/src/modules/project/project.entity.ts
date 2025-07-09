import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

/**
 * Project 实体，代表一个训练项目
 * @property {Types.ObjectId} id - 项目ID
 * @property {string} name - 项目名称
 * @property {string} [description] - 项目描述
 * @property {string} userId - 用户ID
 * @property {number} seqNo - 顺序号
 * @property {string} [todayWorkoutId] - 当天训练ID
 * @property {Date} [createdAt] - 创建时间
 * @property {Date} [updatedAt] - 更新时间
 * @property {string} category - 分类
 * @property {string} [defaultUnit] - 默认单位
 * @property {number} [defaultWeight] - 默认重量
 */
@Schema({ timestamps: true })
export class Project {
    @Prop({ type: Types.ObjectId, auto: true })
      id: Types.ObjectId;

    @Prop({ required: true })
      name: string;

    @Prop()
      description?: string;

    @Prop({ required: true })
      userId: string;

    @Prop({ required: true, default: 0 })
      seqNo: number;

    // 当天的训练记录ID，由 service 层处理
    todayWorkoutId?: string;

    // 创建时间，由 timestamps 自动管理
    createdAt?: Date;

    // 更新时间，由 timestamps 自动管理
    updatedAt?: Date;

    @Prop({ required: true })
      category: string;

    @Prop({ required: true })
      defaultUnit: string;

    @Prop({ required: false })
      defaultWeight?: number;

    @Prop({ required: false, type: [String], default: [] })
      equipments?: string[]; // 器械，数组
}

/**
 * ProjectSchema，包含联合唯一索引：name + userId
 */
export const ProjectSchema = SchemaFactory.createForClass(Project);
// 行上注释：name 和 userId 联合唯一
ProjectSchema.index({ name: 1, userId: 1 }, { unique: true });
