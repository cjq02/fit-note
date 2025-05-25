import { useQuery } from '@tanstack/react-query';
import { Card, Dialog, ErrorBlock, InfiniteScroll, List, SwipeAction, Toast } from 'antd-mobile';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { ApiResponse, Workout as WorkoutType } from '@/@typings/types.d.ts';
import { deleteWorkout, getWorkoutsGroupByDate } from '@/api/workout.api';

/**
 * 计算训练项目的总训练量（组数 × 次数）
 *
 * @param {WorkoutType[]} workouts - 当前日期的训练记录
 * @param {string} project - 训练项目名称
 * @returns {number} 总训练量
 */
const calculateProjectTotal = (workouts: WorkoutType[], project: string): number => {
  return workouts
    .filter(workout => workout.project === project)
    .reduce((total, workout) => {
      // 计算每组的总次数
      const groupTotal = workout.groups.reduce((sum, group) => sum + group.reps, 0);
      return total + groupTotal;
    }, 0);
};

/**
 * 训练记录页面组件
 *
 * @returns {JSX.Element} 训练记录页面
 */
export const Workout = () => {
  const navigate = useNavigate();
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
   * 处理删除训练记录
   *
   * @param {string} id - 训练记录ID
   */
  const handleDelete = (id: string) => {
    Dialog.confirm({
      content: '确定要删除这条训练记录吗？',
      onConfirm: async () => {
        try {
          await deleteWorkout(id);
          Toast.show({
            icon: 'success',
            content: '删除成功',
          });
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
        } catch (error) {
          Toast.show({
            icon: 'fail',
            content: '删除失败',
          });
        }
      },
    });
  };

  /**
   * 处理编辑训练记录
   *
   * @param {string} id - 训练记录ID
   */
  const handleEdit = (id: string) => {
    navigate(`/workout/edit/${id}`);
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

  const rightActions = (id: string) => [
    {
      key: 'delete',
      text: '删除',
      color: 'danger',
      onClick: () => handleDelete(id),
    },
  ];

  return (
    <div className="page-container bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <div className="flex-1 overflow-y-auto px-4 pt-4">
        {/* 训练记录列表 */}
        {Object.entries(allWorkouts).map(([date, workouts]) => (
          <div key={date} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-4 bg-gradient-to-b from-blue-500 to-sky-500 rounded-full"></div>
              <div className="text-[15px] font-medium text-blue-600 tracking-wide">{date}</div>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-blue-100 to-transparent"></div>
            </div>
            <List>
              {workouts.map(workout => (
                <SwipeAction key={workout.id} rightActions={rightActions(workout.id)}>
                  <List.Item className="[&_.adm-list-item-content-main]:!py-1">
                    <Card
                      className="w-full transition-all duration-200 active:scale-[0.98]"
                      style={{
                        borderRadius: '16px',
                        background:
                          'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
                        backdropFilter: 'blur(10px)',
                        marginBottom: '2px',
                        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.1)',
                      }}
                      onClick={() => handleEdit(workout.id)}
                    >
                      <div className="flex flex-col gap-3">
                        {/* 项目名称和总训练量 */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-sky-500 rounded-full"></div>
                            <div>
                              <div className="font-semibold text-gray-800 text-[16px] tracking-wide">
                                {workout.project}
                              </div>
                            </div>
                          </div>
                          <div className="text-blue-500 font-medium">
                            <span className="text-sm bg-gradient-to-r from-blue-500 to-sky-500 text-white px-4 py-1.5 rounded-full shadow-sm">
                              {calculateProjectTotal(workouts, workout.project)}次
                            </span>
                          </div>
                        </div>

                        {/* 训练组信息 */}
                        <div className="flex gap-2 flex-wrap">
                          {workout.groups.map((group, index) => (
                            <div
                              key={index}
                              className="text-xs text-blue-600 bg-gradient-to-r from-blue-50 to-sky-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm"
                            >
                              {group.seqNo}组: {group.weight}
                              {workout.unit} × {group.reps}次
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                </SwipeAction>
              ))}
            </List>
          </div>
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
