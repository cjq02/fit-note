import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './project.entity';
import { ProjectService } from './project.service';

@Controller('project')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

    @Get('find-all')
  findAll(@Request() req): Promise<Project[]> {
    return this.projectService.findAll(req.user.id);
  }

    @Get('get/:id')
    findOne(@Param('id') id: string): Promise<Project> {
      return this.projectService.findOne(id);
    }

    @Post('create')
    create(
        @Request() req,
        @Body() createProjectDto: CreateProjectDto
    ): Promise<Project> {
      return this.projectService.create(createProjectDto, req.user.id);
    }

    @Put('update/:id')
    update(
        @Param('id') id: string,
        @Body() updateProjectDto: UpdateProjectDto,
    ): Promise<Project> {
      return this.projectService.update(id, updateProjectDto);
    }

    @Delete('remove/:id')
    remove(@Param('id') id: string): Promise<void> {
      return this.projectService.remove(id);
    }
}
