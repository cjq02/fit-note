import { http } from './http';
import type { ApiResponse, CreateProjectRequest, Project, UpdateProjectRequest } from './types';

// 获取训练项目列表
export const getProjects = async (): Promise<ApiResponse<Project[]>> => {
  // 直接使用后端返回的数据，包含 todayWorkoutId 字段
  return http.get<Project[]>('/api/projects');
};

// 获取训练项目详情
export const getProject = async (id: string): Promise<ApiResponse<Project>> => {
  const response = await http.get<Project>(`/api/projects/${id}`);
  return response;
};

// 创建训练项目
export const createProject = async (data: CreateProjectRequest): Promise<ApiResponse<Project>> => {
  const response = await http.post<Project>('/api/projects', data);
  return response;
};

// 更新训练项目
export const updateProject = async (data: UpdateProjectRequest): Promise<ApiResponse<Project>> => {
  const response = await http.put<Project>(`/api/projects/${data.id}`, data);
  return response;
};

// 删除训练项目
export const deleteProject = async (id: string): Promise<ApiResponse<void>> => {
  const response = await http.delete<void>(`/api/projects/${id}`);
  return response;
};
