// API 响应类型
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
  total: number;
}

// 训练记录类型
export interface Workout {
  id: string;
  date: string;
  projectName: string;
  projectId: string;
  unit: string;
  trainingTime?: number;
  groups: WorkoutGroup[];
  createdAt: string;
  updatedAt: string;
  remark?: string;
}

// 训练组类型
export interface WorkoutGroup {
  reps: number;
  weight: number;
  seqNo: number;
  restTime?: number;
}

// 创建训练记录的请求参数
export interface CreateWorkoutRequest {
  date: string;
  projectName: string;
  projectId?: string;
  unit: string;
  trainingTime?: number;
  groups: WorkoutGroup[];
  remark?: string;
}

// 更新训练记录的请求参数
export interface UpdateWorkoutRequest extends CreateWorkoutRequest {
  id: string;
  remark?: string;
}

/**
 * 训练项目类型
 *
 * @property {string} id - 项目ID
 * @property {string} name - 项目名称
 * @property {string} [description] - 项目描述
 * @property {number} seqNo - 排序号
 * @property {'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Abs' | 'Cardio' | 'Core'} category - 项目类别
 * @property {string | null} latestWorkoutId - 最近一次训练记录ID，如果没有则为null
 * @property {string} latestWorkoutDate - 最近训练日期
 * @property {string} createdAt - 创建时间
 * @property {string} updatedAt - 更新时间
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  seqNo: number;
  category: 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Abs' | 'Cardio' | 'Core';
  latestWorkoutId: string | null; // 最近一次训练记录ID，如果没有则为null
  latestWorkoutDate: string | null; // 最近训练日期
  createdAt: string;
  updatedAt: string;
  totalDays: number;
  defaultUnit: string;
  defaultWeight?: number;
  equipments?: string[]; // 器械，数组
}

/**
 * 创建训练项目请求参数
 *
 * @property {string} name - 项目名称
 * @property {string} [description] - 项目描述
 * @property {number} seqNo - 排序号
 * @property {'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Abs' | 'Cardio' | 'Core'} category - 项目类别
 */
export interface CreateProjectRequest {
  name: string;
  description?: string;
  seqNo: number;
  category: 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Abs' | 'Cardio' | 'Core';
  defaultUnit: string;
  defaultWeight?: number;
  equipments?: string[]; // 器械，数组
}

/**
 * 更新训练项目请求参数
 *
 * @augments CreateProjectRequest
 * @property {string} id - 项目ID
 */
export interface UpdateProjectRequest extends CreateProjectRequest {
  id: string;
  equipments?: string[]; // 器械，数组
}

// 登录请求参数
export interface LoginRequest {
  username: string;
  password: string;
}

// 注册请求参数
export interface RegisterRequest {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

// 用户信息
export interface UserInfo {
  id: string;
  username: string;
  isAdmin: boolean;
}

// 获取用户信息响应
export interface GetUserInfoResponse {
  user: UserInfo;
}

// 训练统计信息类型
export interface WorkoutStats {
  weeklyDays: number;
  monthlyDays: number;
  continuousDays: number;
  totalDays: number;
  withoutWorkoutDays: number;
}

export interface WorkoutWeekStats {
  projectName: string;
  totalGroups: number;
  totalReps: number;
  totalDays: number;
}

export interface WorkoutWeekResponse {
  data: Array<{
    period: string;
    periodTotalDays: number;
    stats: WorkoutWeekStats[];
  }>;
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 按category分组的训练统计类型
export interface WorkoutCategoryStats {
  category: string;
  categoryName: string;
  totalDays: number;
  totalGroups: number;
  totalReps: number;
}

// 按category分组的训练记录响应类型
export interface WorkoutCategoryResponse {
  data: Array<{
    period: string;
    periodTotalDays: number;
    stats: WorkoutCategoryStats[];
  }>;
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 统计模块相关类型定义
export interface StatsPeriodData {
  period: string;
  periodTotalDays: number;
  stats: Array<{
    projectName: string;
    totalGroups: number;
    totalReps: number;
    totalDays: number;
  }>;
}

export interface StatsPeriodResponse {
  data: StatsPeriodData[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface StatsCategoryData {
  period: string;
  periodTotalDays: number;
  stats: Array<{
    category: string;
    categoryName: string;
    totalDays: number;
    totalGroups: number;
    totalReps: number;
  }>;
}

export interface StatsCategoryResponse {
  data: StatsCategoryData[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
