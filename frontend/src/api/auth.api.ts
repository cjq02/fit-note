import { http } from '@/utils/http';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  GetUserInfoResponse,
} from '@/@typings/types.d.ts';

// 登录
/**
 * 用户登录
 *
 * @param {LoginRequest} data - 登录请求参数
 * @returns {Promise<ApiResponse<LoginResponse>>} 登录响应，包含 token
 */
export const login = async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await http.post<LoginResponse>('/api/auth/login', data);
  return response;
};

// 注册
/**
 * 用户注册
 *
 * @param {RegisterRequest} data - 注册请求参数
 * @returns {Promise<ApiResponse<void>>} 注册响应
 */
export const register = async (data: RegisterRequest): Promise<ApiResponse<void>> => {
  const response = await http.post<void>('/api/auth/register', data);
  return response;
};

// 获取用户信息
/**
 * 获取当前登录用户信息
 *
 * @returns {Promise<ApiResponse<GetUserInfoResponse>>} 用户信息响应
 */
export const getUserInfo = async (): Promise<ApiResponse<GetUserInfoResponse>> => {
  const response = await http.get<GetUserInfoResponse>('/api/auth/profile');
  return response;
};

/**
 * 修改密码
 *
 * @param data
 * @param data.oldPassword 旧密码
 * @param data.newPassword 新密码
 * @returns {Promise<any>} 修改结果
 */
export const changePassword = (data: { oldPassword: string; newPassword: string }) => {
  return http.post('/api/auth/change-password', data);
};

// 获取所有用户（仅管理员）
/**
 * 获取所有用户（仅管理员）
 *
 * @returns {Promise<any>} 用户列表
 */
export const getAllUsers = async () => {
  return http.get('/api/auth/users');
};

// 管理员切换为指定用户
/**
 * 管理员切换为指定用户
 *
 * @param {string} userId - 目标用户ID
 * @returns {Promise<any>} 新的 token
 */
export const impersonateUser = async (userId: string) => {
  return http.post(`/api/auth/impersonate/${userId}`);
};
