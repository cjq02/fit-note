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
  unit: 'kg' | 'lb';
  trainingTime?: number;
  groups: WorkoutGroup[];
  createdAt: string;
  updatedAt: string;
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
  unit: 'kg' | 'lb';
  trainingTime?: number;
  groups: WorkoutGroup[];
}

// 更新训练记录的请求参数
export interface UpdateWorkoutRequest extends CreateWorkoutRequest {
  id: string;
}

// 训练项目类型
export interface Project {
  id: string;
  name: string;
  description?: string;
  seqNo: number;
  category: '胸' | '背' | '肩' | '手臂' | '腿' | '腹';
  todayWorkoutId: string | null; // 当天的训练记录ID，如果没有则为null
  createdAt: string;
  updatedAt: string;
}

// 创建训练项目请求参数
export interface CreateProjectRequest {
  name: string;
  description?: string;
  seqNo: number;
  category: '胸' | '背' | '肩' | '手臂' | '腿' | '腹';
}

// 更新训练项目请求参数
export interface UpdateProjectRequest extends CreateProjectRequest {
  id: string;
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
    stats: WorkoutWeekStats[];
  }>;
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
