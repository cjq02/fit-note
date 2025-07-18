import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true, unique: true })
      username: string;

    @Prop({ required: true })
      password: string;

    @Prop({ default: 0 })
      loginFailCount: number;

    @Prop()
      lastLoginFailAt?: Date;

    @Prop({ default: false })
      isAdmin: boolean;

    // 创建时间，由 timestamps 自动管理
    createdAt?: Date;

    // 更新时间，由 timestamps 自动管理
    updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// 在保存前加密密码
UserSchema.pre('save', async function (next) {
  // 只有在密码被修改时才重新加密
  if (!this.isModified('password')) {
    return next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// 添加验证密码的方法
UserSchema.methods.validatePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};
