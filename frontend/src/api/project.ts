import { http } from './http';
import type { CreateProjectRequest, Project, UpdateProjectRequest } from './types';

// 获取训练项目列表
export const getProjects = () => {
    return http.get<Project[]>('/api/projects');
};

// 获取训练项目详情
export const getProject = (id: number) => {
    return http.get<Project>(`/api/projects/${id}`);
};

// 创建训练项目
export const createProject = (data: CreateProjectRequest) => {
    return http.post<Project>('/api/projects', data);
};

// 更新训练项目
export const updateProject = (data: UpdateProjectRequest) => {
    return http.put<Project>(`/api/projects/${data.id}`, data);
};

// 删除训练项目
export const deleteProject = (id: number) => {
    return http.delete<void>(`/api/projects/${id}`);
}; 