import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkoutDocument = Workout & Document;

// 训练组类型
@Schema()
export class WorkoutGroup {
    @Prop({ required: true, type: Number, min: 1, max: 1000 })
      reps: number;

    @Prop({ required: true, type: Number, min: 0, max: 1000 })
      weight: number;

    @Prop({ required: true, type: Number, min: 1 })
      seqNo: number;

    @Prop({ type: Number, default: 0, min: 0 })
      restTime: number;
}

@Schema()
export class Workout {
    @Prop({ required: true })
      userId: string;

    @Prop({ required: true })
      date: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
      projectId: Types.ObjectId;

    @Prop({ required: true })
      projectName: string;

    /**
     * 重量单位
     * @type {string} 单位字符串，如'kg'或'lb'
     */
    @Prop({ required: true, type: String })
      unit: string;

    @Prop({ required: true, type: [WorkoutGroup] })
      groups: WorkoutGroup[];

    @Prop({ type: Number, default: 0 })
      trainingTime: number;

    @Prop({ required: false })
      /**
       * 备注
       * @type {string} 备注信息
       */
      remark?: string;

    @Prop({ default: Date.now })
      createdAt: Date;

    @Prop({ default: Date.now })
      updatedAt: Date;
}

export const WorkoutSchema = SchemaFactory.createForClass(Workout);
