import { PartialType } from '@nestjs/mapped-types';

import { CreateWorkoutDto } from './create-workout.dto';

export class UpdateWorkoutDto extends PartialType(CreateWorkoutDto) {
  // UpdateWorkoutDto 支持所有 CreateWorkoutDto 字段，包括remark
}
