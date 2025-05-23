// 训练记录类型
export interface Workout {
    id: string;
    date: string;
    project: string;
    unit: 'kg' | 'lb';
    groups: WorkoutGroup[];
    createdAt: string;
    updatedAt: string;
}

// 训练组类型
export interface WorkoutGroup {
    reps: number;
    weight: number;
}

// 创建训练记录的请求参数
export interface CreateWorkoutRequest {
    date: string;
    project: string;
    projectId?: string;
    unit: 'kg' | 'lb';
    groups: WorkoutGroup[];
}

// 更新训练记录的请求参数
export interface UpdateWorkoutRequest extends CreateWorkoutRequest {
    id: string;
}

// API 响应类型
export interface ApiResponse<T> {
    code: number;
    data: T;
    message: string;
}

// 训练项目类型
export interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

// 创建训练项目请求参数
export interface CreateProjectRequest {
    name: string;
    description?: string;
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