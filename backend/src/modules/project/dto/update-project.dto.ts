import { PartialType } from '@nestjs/mapped-types';

import { CreateProjectDto } from './create-project.dto';

// equipments 字段同样支持
export class UpdateProjectDto extends PartialType(CreateProjectDto) { }
