import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Dialog,
  Empty,
  InfiniteScroll,
  List,
  Space,
  SwipeAction,
  Tag,
  Toast,
} from 'antd-mobile';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { Workout as WorkoutType } from '@/@typings/types.d.ts';
import { deleteWorkout, getWorkoutsGroupByDate } from '@/api/workout.api';

interface ApiResponse {
  data: Record<string, WorkoutType[]>;
  total: number;
}

/**
 * 计算训练项目在当前日期的次数
 *
 * @param {Record<string, WorkoutType[]>} workouts - 按日期分组的训练记录
 * @param {string} currentDate - 当前日期
 * @returns {Record<string, number>} 训练项目及其次数
 */
const calculateProjectCounts = (
  workouts: Record<string, WorkoutType[]>,
  currentDate: string,
): Record<string, number> => {
  const counts: Record<string, number> = {};

  // 获取当前日期的训练记录
  const currentWorkouts = workouts[currentDate] || [];

  // 统计每个项目的次数
  currentWorkouts.forEach(workout => {
    counts[workout.project] = (counts[workout.project] || 0) + 1;
  });

  return counts;
};

/**
 * 计算训练项目在当前日期的次数
 *
 * @param {WorkoutType[]} workouts - 当前日期的训练记录
 * @param {string} project - 训练项目名称
 * @returns {number} 训练次数
 */
const calculateProjectCount = (workouts: WorkoutType[], project: string): number => {
  return workouts.filter(workout => workout.project === project).length;
};

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
  const [currentDate, setCurrentDate] = useState<string>('');

  // 获取按日期分组的训练记录
  const { data: groupedWorkoutsData, refetch } = useQuery<ApiResponse>({
    queryKey: ['workouts', 'group-by-date', page],
    queryFn: async () => {
      const response = await getWorkoutsGroupByDate({
        page,
        pageSize,
      });
      return response.data;
    },
    staleTime: 0, // 数据立即过期
    gcTime: 0, // 不缓存数据
    enabled: false, // 禁用自动查询
  });

  // 处理数据加载成功
  useEffect(() => {
    if (groupedWorkoutsData) {
      if (page === 1) {
        setAllWorkouts(groupedWorkoutsData.data);
        // 设置当前日期为第一条数据的日期
        const firstDate = Object.keys(groupedWorkoutsData.data)[0];
        if (firstDate) {
          setCurrentDate(firstDate);
        }
      } else {
        // 合并新数据
        const newWorkouts = { ...allWorkouts };
        Object.entries(groupedWorkoutsData.data).forEach(([date, workouts]) => {
          if (newWorkouts[date]) {
            newWorkouts[date] = [...newWorkouts[date], ...workouts];
          } else {
            newWorkouts[date] = workouts;
          }
        });
        setAllWorkouts(newWorkouts);
      }
      hasMore.current = groupedWorkoutsData.total > page * pageSize;
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
    <div className="h-screen flex flex-col bg-[var(--adm-color-background)]">
      <div className="flex-1 overflow-y-auto px-3 pb-20 pt-2">
        {/* 训练记录列表 */}
        {Object.entries(allWorkouts).map(([date, workouts]) => (
          <div key={date} className="mb-1.5">
            <div className="text-xs text-[var(--adm-color-text-light)] mb-1 px-1">{date}</div>
            <List>
              {workouts.map(workout => (
                <SwipeAction key={workout.id} rightActions={rightActions(workout.id)}>
                  <List.Item className="[&_.adm-list-item-content-main]:!py-1">
                    <Card
                      className="w-full transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                      style={{
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        marginBottom: '2px',
                      }}
                      onClick={() => handleEdit(workout.id)}
                    >
                      <div className="flex flex-col gap-1">
                        {/* 项目名称和总训练量 */}
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-[var(--adm-color-text)] text-[15px]">
                              {workout.project}
                            </div>
                          </div>
                          <div className="text-[var(--adm-color-primary)] font-medium">
                            <span className="text-sm">
                              共{calculateProjectTotal(workouts, workout.project)}次
                            </span>
                          </div>
                        </div>

                        {/* 训练组信息 */}
                        <div className="flex gap-1.5 flex-wrap">
                          {workout.groups.map((group, index) => (
                            <Tag
                              key={index}
                              color="primary"
                              fill="outline"
                              className="text-xs px-1.5 py-0.5 rounded-full"
                            >
                              {group.seqNo}组: {group.weight}
                              {workout.unit} × {group.reps}次
                            </Tag>
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
        <InfiniteScroll
          loadMore={loadMore}
          hasMore={hasMore.current}
          threshold={0.8} // 当滚动到距离底部 80% 时触发加载
        />

        {/* 空状态 */}
        {(!allWorkouts || Object.keys(allWorkouts).length === 0) && !isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Empty description="暂无训练记录" />
          </div>
        )}
      </div>
    </div>
  );
};
