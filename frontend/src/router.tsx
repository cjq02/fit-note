import { createBrowserRouter, Navigate } from 'react-router-dom';

import { App } from './App';
import { Home } from './pages/home/Home';
import { Login } from './pages/login/Login';
import { Register } from './pages/login/Register';
import { Profile } from './pages/profile/Profile';
import { ProjectList } from './pages/project/ProjectList';
import { Workout } from './pages/workout/Workout';
import { WorkoutForm } from './pages/workout/WorkoutForm';

// 路由守卫组件
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// 定义路由配置
const routes = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: '',
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: 'project',
        element: (
          <PrivateRoute>
            <ProjectList />
          </PrivateRoute>
        ),
      },
      {
        path: 'workout',
        element: (
          <PrivateRoute>
            <Workout />
          </PrivateRoute>
        ),
      },
      {
        path: 'workout/:id',
        element: (
          <PrivateRoute>
            <WorkoutForm />
          </PrivateRoute>
        ),
      },
      {
        path: 'workout/new',
        element: (
          <PrivateRoute>
            <WorkoutForm />
          </PrivateRoute>
        ),
      },
      {
        path: 'workout/new/:projectName',
        element: (
          <PrivateRoute>
            <WorkoutForm />
          </PrivateRoute>
        ),
      },
      {
        path: 'workout/edit/:id',
        element: (
          <PrivateRoute>
            <WorkoutForm />
          </PrivateRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
    ],
  },
];

// 创建路由
export const router = createBrowserRouter(routes);
