import { useQuery } from '@tanstack/react-query';
import { ErrorBlock, InfiniteScroll } from 'antd-mobile';
import { useEffect, useRef, useState, useCallback } from 'react';
import PageSelect from '@/components/PageSelect';
import { CATEGORY_OPTIONS } from '@/pages/project/categoryOptions';
import { getProjects } from '@/api/project.api';

import type { ApiResponse, Workout as WorkoutType } from '@/@typings/types.d.ts';
import { getWorkoutsGroupByDate } from '@/api/workout.api';
import { WorkoutDayGroup } from './components/WorkoutDayGroup';

/**
 * 训练记录列表页面组件
 *
 * @returns {JSX.Element} 训练记录列表页面
 */
export const WorkoutList = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const hasMore = useRef(true);
  const [allWorkouts, setAllWorkouts] = useState<Record<string, WorkoutType[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const isFirstLoad = useRef(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 新增：类别和项目筛选相关状态
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [projectOptions, setProjectOptions] = useState<
    { label: string; value: string; category: string }[]
  >([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  // 新增：缓存所有项目
  const [allProjects, setAllProjects] = useState<any[]>([]);

  // 新增：回到顶部按钮显示状态
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 获取按日期分组的训练记录
  const { data: groupedWorkoutsData, refetch } = useQuery<
    ApiResponse<{ data: Record<string, WorkoutType[]>; total: number }>
  >({
    queryKey: ['workouts', 'group-by-date', page, selectedProject, selectedCategory],
    queryFn: async () => {
      const response = await getWorkoutsGroupByDate({
        page,
        pageSize,
        projectId: selectedProject || undefined,
        category: selectedCategory || undefined,
      });
      return response;
    },
    staleTime: 0, // 数据立即过期
    gcTime: 0, // 不缓存数据
    enabled: false, // 禁用自动查询
  });

  // 处理数据加载成功
  useEffect(() => {
    if (groupedWorkoutsData) {
      if (page === 1) {
        setAllWorkouts(groupedWorkoutsData.data.data);
      } else {
        // 合并新数据
        const newWorkouts = { ...allWorkouts };
        Object.entries(groupedWorkoutsData.data.data).forEach(([date, workouts]) => {
          if (newWorkouts[date]) {
            newWorkouts[date] = [...newWorkouts[date], ...workouts];
          } else {
            newWorkouts[date] = workouts;
          }
        });
        setAllWorkouts(newWorkouts);
      }
      hasMore.current = groupedWorkoutsData.data.total > page * pageSize;
    }
  }, [groupedWorkoutsData, page]);

  // 首次加载数据
  useEffect(() => {
    const loadInitialData = async () => {
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
        setIsLoading(true);
        try {
          await refetch();
          setIsInitialized(true);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadInitialData();
  }, []);

  // 页码变化时加载数据
  useEffect(() => {
    const loadMoreData = async () => {
      if (isInitialized) {
        setIsLoading(true);
        try {
          await refetch();
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadMoreData();
  }, [page]);

  // 只在挂载时请求一次所有项目
  useEffect(() => {
    setProjectLoading(true);
    getProjects()
      .then(res => {
        const list = res.data || [];
        setAllProjects(list);
        // 初始筛选
        let filtered = list;
        if (selectedCategory) {
          filtered = list.filter((p: any) => p.category === selectedCategory);
        }
        const opts = filtered.map((p: any) => ({
          label: p.name,
          value: p.id,
          category: p.category,
        }));
        setProjectOptions(opts);
        if (selectedProject && !opts.find(opt => opt.value === selectedProject)) {
          setSelectedProject(null);
        }
      })
      .finally(() => setProjectLoading(false));
  }, []);

  // 切换类别时本地筛选项目并查询
  useEffect(() => {
    let filtered = allProjects;
    if (selectedCategory) {
      filtered = allProjects.filter((p: any) => p.category === selectedCategory);
    }
    const opts = filtered.map((p: any) => ({ label: p.name, value: p.id, category: p.category }));
    setProjectOptions(opts);
    if (selectedProject && !opts.find(opt => opt.value === selectedProject)) {
      setSelectedProject(null);
    }
    setPage(1);
    if (isInitialized) {
      refetch();
    }
  }, [selectedCategory, allProjects]);

  // 切换项目时自动查询
  useEffect(() => {
    setPage(1);
    if (isInitialized) {
      refetch();
    }
  }, [selectedProject]);

  // 监听滚动，控制回到顶部按钮显示（只监听第二个 overflow-y-auto 容器）
  useEffect(() => {
    const containers = document.querySelectorAll('.overflow-y-auto');
    const container = containers[1]; // 只监听第二个
    if (!container) return;
    const handleScroll = () => {
      setShowBackToTop(container.scrollTop > 200);
    };
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 回到顶部函数（只操作第二个 overflow-y-auto 容器）
  const handleBackToTop = useCallback(() => {
    const containers = document.querySelectorAll('.overflow-y-auto');
    const container = containers[1];
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  /**
   * 处理删除成功后的刷新
   */
  const handleDeleteSuccess = async () => {
    setPage(1);
    setAllWorkouts({});
    isFirstLoad.current = true;
    setIsLoading(true);
    try {
      await refetch();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 加载更多数据
   */
  const loadMore = async () => {
    // 检查是否已初始化
    if (!isInitialized) {
      console.log('页面未初始化完成，不触发加载');
      return;
    }

    // 检查是否正在加载或没有更多数据
    if (!hasMore.current || isLoading) {
      console.log('不满足加载条件:', { hasMore: hasMore.current, isLoading });
      return;
    }

    // 获取滚动容器和内容高度
    const container = document.querySelector('.overflow-y-auto');
    if (!container) {
      console.log('未找到滚动容器');
      return;
    }

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;

    console.log('滚动信息:', {
      scrollTop,
      scrollHeight,
      clientHeight,
      distanceToBottom,
      currentPage: page,
    });

    // 只有当滚动到距离底部 300px 以内时才加载
    if (distanceToBottom > 300) {
      console.log('距离底部太远，不触发加载');
      return;
    }

    console.log('触发加载下一页:', page + 1);
    setPage(prev => prev + 1);
  };

  // 调试：打印所有 overflow-y-auto 元素
  useEffect(() => {
    const containers = document.querySelectorAll('.overflow-y-auto');
    console.log('找到的overflow-y-auto元素数量:', containers.length, containers);
  }, []);

  // 调试：监听 window 的 scroll 事件
  useEffect(() => {
    const handleScroll = () => {
      console.log('window scrollTop:', window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="page-container from-gray-50 via-gray-50 to-gray-100">
      <div className="px-2 pt-2 pb-0 flex gap-2">
        <div style={{ flex: 1 }}>
          <PageSelect
            options={CATEGORY_OPTIONS}
            placeholder="请选择类别"
            value={selectedCategory ?? ''}
            onChange={val => {
              setSelectedCategory(val as string);
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <PageSelect
            options={projectOptions}
            value={selectedProject ?? ''}
            placeholder="请选择项目"
            onChange={val => {
              setSelectedProject(val as string);
            }}
            loading={projectLoading}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pt-0">
        {/* 训练记录列表 */}
        {Object.entries(allWorkouts).map(([date, workouts]) => (
          <WorkoutDayGroup
            key={date}
            date={date}
            workouts={workouts}
            onDeleteSuccess={handleDeleteSuccess}
          />
        ))}

        {/* 无限滚动加载 */}
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore.current} threshold={0.8} />

        {/* 空状态 */}
        {(!allWorkouts || Object.keys(allWorkouts).length === 0) && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <ErrorBlock status="empty" description="暂无训练记录" />
          </div>
        )}
      </div>
      {/* 回到顶部悬浮按钮 */}
      {showBackToTop && (
        <button
          onClick={handleBackToTop}
          style={{
            position: 'fixed',
            right: 24,
            bottom: 80,
            zIndex: 100,
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: '#fff', // 背景白色
            color: '#222', // 文字颜色黑色
            border: 'none',
            boxShadow: '0 8px 32px 0 rgba(128,128,128,0.18), 0 1.5px 6px 0 rgba(128,128,128,0.13)', // 灰色阴影
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'box-shadow 0.2s, background 0.2s, opacity 0.2s',
            opacity: 0.7,
            backdropFilter: 'blur(2px)',
          }}
          aria-label="回到顶部"
          onMouseOver={e => {
            e.currentTarget.style.boxShadow =
              '0 12px 36px 0 rgba(128,128,128,0.28), 0 2px 8px 0 rgba(128,128,128,0.18)';
            e.currentTarget.style.opacity = '1';
          }}
          onMouseOut={e => {
            e.currentTarget.style.boxShadow =
              '0 8px 32px 0 rgba(128,128,128,0.18), 0 1.5px 6px 0 rgba(128,128,128,0.13)';
            e.currentTarget.style.opacity = '0.92';
          }}
        >
          {/* SVG 向上箭头图标 */}
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="15" cy="15" r="15" fill="none" />
            <path
              d="M10 17l5-5 5 5"
              stroke="#222" // 图标颜色黑色
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
