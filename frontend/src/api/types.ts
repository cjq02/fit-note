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