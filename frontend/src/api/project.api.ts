import { http } from '@/utils/http';
import type {
  ApiResponse,
  CreateProjectRequest,
  Project,
  UpdateProjectRequest,
} from '@/@typings/types.d.ts';

// 获取训练项目列表
/**
 * 获取所有训练项目
 *
 * @returns {Promise<ApiResponse<Project[]>>} 训练项目列表
 */
export const getProjects = async (): Promise<ApiResponse<Project[]>> => {
  return http.get<Project[]>('/api/project/find-all');
};

// 获取训练项目详情
/**
 * 获取单个训练项目详情
 *
 * @param {string} id - 项目ID
 * @returns {Promise<ApiResponse<Project>>} 训练项目详情
 */
export const getProject = async (id: string): Promise<ApiResponse<Project>> => {
  const response = await http.get<Project>(`/api/project/get/${id}`);
  return response;
};

// 创建训练项目
/**
 * 创建新的训练项目
 *
 * @param {CreateProjectRequest} data - 创建项目请求参数
 * @returns {Promise<ApiResponse<Project>>} 创建的项目信息
 */
export const createProject = async (data: CreateProjectRequest): Promise<ApiResponse<Project>> => {
  const response = await http.post<Project>('/api/project/create', { ...data });
  return response;
};

// 更新训练项目
/**
 * 更新训练项目信息
 *
 * @param {UpdateProjectRequest} data - 更新项目请求参数
 * @returns {Promise<ApiResponse<Project>>} 更新后的项目信息
 */
export const updateProject = async (data: UpdateProjectRequest): Promise<ApiResponse<Project>> => {
  const response = await http.put<Project>(`/api/project/update/${data.id}`, data);
  return response;
};

// 删除训练项目
/**
 * 删除训练项目
 *
 * @param {string} id - 项目ID
 * @returns {Promise<ApiResponse<void>>} 删除操作响应
 */
export const deleteProject = async (id: string): Promise<ApiResponse<void>> => {
  const response = await http.delete<void>(`/api/project/remove/${id}`);
  return response;
};
