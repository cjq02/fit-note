import { createBrowserRouter, Navigate, useNavigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import { App } from './App';
import { Home } from './pages/home/Home';
import { Login } from './pages/login/Login';
import { Register } from './pages/login/Register';
import { Profile } from './pages/profile/Profile';
import { ProjectList } from './pages/project/ProjectList';
import { WorkoutList } from './pages/workout/WorkoutList';
import { WorkoutForm } from './pages/workout/WorkoutForm';
import { Schedule } from './pages/workout/Schedule';
import ProjectFormPage from '@/pages/project/ProjectFormPage';

/**
 * 扩展路由类型，添加 title 属性
 */
type CustomRouteObject = RouteObject & {
  title?: string;
  children?: CustomRouteObject[];
  onBack?: () => void;
};

// 路由守卫组件
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// 定义路由配置
const routes: CustomRouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'login',
        element: <Login />,
        title: '登录',
      },
      {
        path: 'register',
        element: <Register />,
        title: '注册',
      },
      {
        path: '',
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
        title: '首页',
      },
      {
        path: 'project',
        element: (
          <PrivateRoute>
            <ProjectList />
          </PrivateRoute>
        ),
        title: '训练计划',
      },
      {
        path: 'workout',
        element: (
          <PrivateRoute>
            <WorkoutList />
          </PrivateRoute>
        ),
        title: '训练记录',
      },
      {
        path: 'workout/:id',
        element: (
          <PrivateRoute>
            <WorkoutForm />
          </PrivateRoute>
        ),
        title: '训练详情',
      },
      {
        path: 'workout/new',
        element: (
          <PrivateRoute>
            <WorkoutForm />
          </PrivateRoute>
        ),
        title: '新建训练',
      },
      {
        path: 'workout/new/:projectName',
        element: (
          <PrivateRoute>
            <WorkoutForm />
          </PrivateRoute>
        ),
        title: '新建训练',
      },
      {
        path: 'workout/edit/:id',
        element: (
          <PrivateRoute>
            <WorkoutForm />
          </PrivateRoute>
        ),
        title: '编辑训练',
      },
      {
        path: 'schedule',
        element: (
          <PrivateRoute>
            <Schedule />
          </PrivateRoute>
        ),
        title: '训练日程',
      },
      {
        path: 'profile',
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
        title: '个人中心',
      },
      {
        path: '/project/new',
        element: <ProjectFormPage />,
        title: '新增训练项目',
      },
      {
        path: '/project/edit/:id',
        element: <ProjectFormPage />,
        title: '编辑训练项目',
      },
    ],
  },
];

// 创建路由
export const router = createBrowserRouter(routes);
