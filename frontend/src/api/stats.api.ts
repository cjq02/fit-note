import { http } from '@/utils/http';
import type {
  ApiResponse,
  WorkoutStats,
  StatsPeriodResponse,
  StatsCategoryResponse,
} from '@/@typings/types.d.ts';

/**
 * 获取按周分组的训练记录列表
 *
 * @param {object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.pageSize] - 每页数量
 * @param {string} [params.date] - 日期
 * @param {string} [params.projectId] - 项目ID
 * @returns {Promise<ApiResponse<StatsPeriodResponse>>} 按周分组的训练记录
 */
export const getStatsGroupByWeek = async (params?: {
  page?: number;
  pageSize?: number;
  date?: string;
  projectId?: string;
}): Promise<ApiResponse<StatsPeriodResponse>> => {
  return http.get('/api/stats/group-by-week', { params });
};

/**
 * 获取按月分组的训练记录列表
 *
 * @param {object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.pageSize] - 每页数量
 * @param {string} [params.date] - 日期
 * @param {string} [params.projectId] - 项目ID
 * @returns {Promise<ApiResponse<StatsPeriodResponse>>} 按月分组的训练记录
 */
export const getStatsGroupByMonth = async (params?: {
  page?: number;
  pageSize?: number;
  date?: string;
  projectId?: string;
}): Promise<ApiResponse<StatsPeriodResponse>> => {
  return http.get('/api/stats/group-by-month', { params });
};

/**
 * 获取按年分组的训练记录列表
 *
 * @param {object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.pageSize] - 每页数量
 * @param {string} [params.date] - 日期
 * @param {string} [params.projectId] - 项目ID
 * @returns {Promise<ApiResponse<StatsPeriodResponse>>} 按年分组的训练记录
 */
export const getStatsGroupByYear = async (params?: {
  page?: number;
  pageSize?: number;
  date?: string;
  projectId?: string;
}): Promise<ApiResponse<StatsPeriodResponse>> => {
  return http.get('/api/stats/group-by-year', { params });
};

/**
 * 获取按周根据category分组的训练记录列表
 *
 * @param {object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.pageSize] - 每页数量
 * @param {string} [params.date] - 日期
 * @param {string} [params.projectId] - 项目ID
 * @returns {Promise<ApiResponse<StatsCategoryResponse>>} 按周根据category分组的训练记录
 */
export const getStatsGroupByWeekCategory = async (params?: {
  page?: number;
  pageSize?: number;
  date?: string;
  projectId?: string;
}): Promise<ApiResponse<StatsCategoryResponse>> => {
  return http.get('/api/stats/group-by-week-category', { params });
};

/**
 * 获取按月根据category分组的训练记录列表
 *
 * @param {object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.pageSize] - 每页数量
 * @param {string} [params.date] - 日期
 * @param {string} [params.projectId] - 项目ID
 * @returns {Promise<ApiResponse<StatsCategoryResponse>>} 按月根据category分组的训练记录
 */
export const getStatsGroupByMonthCategory = async (params?: {
  page?: number;
  pageSize?: number;
  date?: string;
  projectId?: string;
}): Promise<ApiResponse<StatsCategoryResponse>> => {
  return http.get('/api/stats/group-by-month-category', { params });
};

/**
 * 获取按年根据category分组的训练记录列表
 *
 * @param {object} params - 查询参数
 * @param {number} [params.page] - 页码
 * @param {number} [params.pageSize] - 每页数量
 * @param {string} [params.date] - 日期
 * @param {string} [params.projectId] - 项目ID
 * @returns {Promise<ApiResponse<StatsCategoryResponse>>} 按年根据category分组的训练记录
 */
export const getStatsGroupByYearCategory = async (params?: {
  page?: number;
  pageSize?: number;
  date?: string;
  projectId?: string;
}): Promise<ApiResponse<StatsCategoryResponse>> => {
  return http.get('/api/stats/group-by-year-category', { params });
};

/**
 * 按年月获取训练记录列表
 *
 * @param {object} params - 查询参数
 * @param {string} params.year - 年份
 * @param {string} params.month - 月份
 * @returns {Promise<ApiResponse<{ data: Record<string, unknown[]>; total: number }>>} 按日期分组的训练记录
 */
export const getStatsByYearMonth = async (params: {
  year: string;
  month: string;
}): Promise<ApiResponse<{ data: Record<string, unknown[]>; total: number }>> => {
  return http.get('/api/stats/by-year-month', { params });
};

/**
 * 获取训练统计信息
 *
 * @returns {Promise<ApiResponse<WorkoutStats>>} 训练统计信息
 */
export const getWorkoutStats = async (): Promise<ApiResponse<WorkoutStats>> => {
  return http.get('/api/stats/workout-stats');
};
