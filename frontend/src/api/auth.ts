import { http } from './http';
import type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, GetUserInfoResponse } from './types';

// 登录
export const login = async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await http.post<LoginResponse>('/api/auth/login', data);
    return response;
};

// 注册
export const register = async (data: RegisterRequest): Promise<ApiResponse<void>> => {
    const response = await http.post<void>('/api/auth/register', data);
    return response;
};

// 获取用户信息
export const getUserInfo = async (): Promise<ApiResponse<GetUserInfoResponse>> => {
    const response = await http.get<GetUserInfoResponse>('/api/auth/profile');
    return response;
}; 