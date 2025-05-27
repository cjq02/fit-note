import { http } from '@/utils/http';
import type {
  ApiResponse,
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  Workout,
} from '@/@typings/types.d.ts';

/**
 *获取训练记录列表
 *
 * @returns {Promise<ApiResponse<Workout[]>>} 训练记录列表
 */
export const getWorkouts = async (): Promise<ApiResponse<Workout[]>> => {
  return http.get('/api/workouts');
};

/**
 *获取单个训练记录
 *
 * @param id
 * @returns {Promise<ApiResponse<Workout>>} 单个训练记录
 */
export const getWorkout = async (id: string): Promise<ApiResponse<Workout>> => {
  return http.get(`/api/workouts/${id}`);
};

/**
 * 创建训练记录
 *
 * @param data
 * @returns {Promise<ApiResponse<Workout>>} 创建训练记录
 */
export const createWorkout = async (data: CreateWorkoutRequest): Promise<ApiResponse<Workout>> => {
  return http.post('/api/workouts', data);
};

/**
 * 更新训练记录
 *
 * @param data
 * @returns {Promise<ApiResponse<Workout>>} 更新训练记录
 */
export const updateWorkout = async (data: UpdateWorkoutRequest): Promise<ApiResponse<Workout>> => {
  return http.put(`/api/workouts/${data.id}`, data);
};

/**
 *删除训练记录
 *
 * @param id
 * @returns {Promise<ApiResponse<void>>} 删除训练记录
 */
export const deleteWorkout = async (id: string): Promise<ApiResponse<void>> => {
  return http.delete(`/api/workouts/${id}`);
};

/**
 * 根据日期和项目ID查询训练记录
 *
 * @param date
 * @param projectId
 * @returns {Promise<ApiResponse<Workout | null>>} 根据日期和项目ID查询训练记录
 */
export const findByDateAndProject = async (
  date: string,
  projectId: string,
): Promise<ApiResponse<Workout | null>> => {
  return http.get('/api/workouts/find', {
    params: { date, projectId },
  });
};

/**
 * 获取按日期分组的训练记录
 *
 * @param {object} params - 查询参数
 * @param {string} [params.date] - 日期
 * @param {string} [params.project] - 训练项目名称
 * @param {number} [params.page] - 页码
 * @param {number} [params.pageSize] - 每页数量
 * @returns {Promise<ApiResponse<{ data: Record<string, Workout[]>; total: number }>>} 按日期分组的训练记录
 */
export const getWorkoutsGroupByDate = async (params?: {
  date?: string;
  project?: string;
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse<{ data: Record<string, Workout[]>; total: number }>> => {
  return http.get('/api/workouts/group-by-date', { params });
};

/**
 * 按年月获取训练记录列表
 *
 * @param {object} params - 查询参数
 * @param {string} params.year - 年份，格式：YYYY，例如：2024
 * @param {string} params.month - 月份，格式：MM，例如：03
 * @returns {Promise<ApiResponse<{ data: Record<string, Workout[]>; total: number }>>} 按日期分组的训练记录
 * @example
 * // 获取2024年3月的训练记录
 * const response = await getWorkoutsByYearMonth({ year: '2024', month: '03' });
 */
export const getWorkoutsByYearMonth = async (params: {
  year: string;
  month: string;
}): Promise<ApiResponse<{ data: Record<string, Workout[]>; total: number }>> => {
  const { year, month } = params;
  return http.get('/api/workouts/by-year-month', {
    params: {
      year,
      month,
    },
  });
};

/**
 * 获取训练统计信息
 *
 * @returns {Promise<ApiResponse<{ weeklyDays: number; monthlyDays: number; continuousDays: number; totalDays: number }>>} 训练统计信息
 */
export const getWorkoutStats = async (): Promise<
  ApiResponse<{
    weeklyDays: number;
    monthlyDays: number;
    continuousDays: number;
    totalDays: number;
  }>
> => {
  return http.get('/api/workouts/stats');
};
