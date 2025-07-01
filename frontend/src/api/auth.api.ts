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
 *
 * @param data
 * @param data.oldPassword
 * @param data.newPassword
 */
export const changePassword = (data: { oldPassword: string; newPassword: string }) => {
  return http.post('/api/auth/change-password', data);
};
