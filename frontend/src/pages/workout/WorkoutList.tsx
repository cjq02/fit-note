import { useQuery } from '@tanstack/react-query';
import { ErrorBlock, InfiniteScroll } from 'antd-mobile';
import { useEffect, useRef, useState } from 'react';

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

  // 获取按日期分组的训练记录
  const { data: groupedWorkoutsData, refetch } = useQuery<
    ApiResponse<{ data: Record<string, WorkoutType[]>; total: number }>
  >({
    queryKey: ['workouts', 'group-by-date', page],
    queryFn: async () => {
      const response = await getWorkoutsGroupByDate({
        page,
        pageSize,
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
      if (page > 1) {
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

  /**
   * 处理删除成功后的刷新
   */
  const handleDeleteSuccess = async () => {
    // 重置状态并重新加载
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

  return (
    <div className="page-container from-gray-50 via-gray-50 to-gray-100">
      <div className="flex-1 overflow-y-auto px-4 pt-4">
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
    </div>
  );
};
