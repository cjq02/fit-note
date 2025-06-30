import 'antd-mobile/es/global';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd-mobile';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { router } from './router';
import zhCN from 'antd-mobile/es/locales/zh-CN';
import './index.css';
import './styles/global.css';

// 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
