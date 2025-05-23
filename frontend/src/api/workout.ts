import { http } from './http';
import type { ApiResponse, CreateWorkoutRequest, UpdateWorkoutRequest, Workout } from './types';

// 获取训练记录列表
export const getWorkouts = async (): Promise<ApiResponse<Workout[]>> => {
    return http.get('/api/workouts');
};

// 获取单个训练记录
export const getWorkout = async (id: string): Promise<ApiResponse<Workout>> => {
    return http.get(`/api/workouts/${id}`);
};

// 创建训练记录
export const createWorkout = async (data: CreateWorkoutRequest): Promise<ApiResponse<Workout>> => {
    return http.post('/api/workouts', data);
};

// 更新训练记录
export const updateWorkout = async (data: UpdateWorkoutRequest): Promise<ApiResponse<Workout>> => {
    return http.put(`/api/workouts/${data.id}`, data);
};

// 删除训练记录
export const deleteWorkout = async (id: string): Promise<ApiResponse<void>> => {
    return http.delete(`/api/workouts/${id}`);
};

// 根据日期和项目ID查询训练记录
export const findByDateAndProject = async (date: string, projectId: string) => {
    return http.get<ApiResponse<Workout | null>>('/api/workouts/find', {
        params: { date, projectId },
    });
}; 