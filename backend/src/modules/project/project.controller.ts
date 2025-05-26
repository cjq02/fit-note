import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './project.entity';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    @Get()
    findAll(@Request() req): Promise<Project[]> {
        return this.projectService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Project> {
        return this.projectService.findOne(id);
    }

    @Post()
    create(@Body() createProjectDto: CreateProjectDto): Promise<Project> {
        return this.projectService.create(createProjectDto);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateProjectDto: UpdateProjectDto,
    ): Promise<Project> {
        return this.projectService.update(id, updateProjectDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.projectService.remove(id);
    }
}
