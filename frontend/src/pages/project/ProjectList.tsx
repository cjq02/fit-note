import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Dialog,
  ErrorBlock,
  FloatingBubble,
  PullToRefresh,
  Skeleton,
  SwipeAction,
  Tag,
  Toast,
  Tabs,
} from 'antd-mobile';
import {
  AddOutline,
  ClockCircleOutline,
  StarOutline,
  CheckCircleOutline,
  CloseCircleOutline,
  MinusCircleOutline,
} from 'antd-mobile-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import type { Project } from '@/@typings/types.d.ts';
import { deleteProject, getProjects } from '@/api/project.api';
import { CATEGORY_OPTIONS } from '@/pages/project/categoryOptions';
import { generateColorFromCategory } from '@/utils/color.utils';

/**
 * 训练项目列表页面组件
 *
 * @returns {JSX.Element} 项目列表页面
 */
export const ProjectList = (): React.ReactElement => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isFirstLoad = useRef(true);

  // 获取训练项目列表
  const {
    data: projects = [],
    isLoading,
    refetch,
  } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await getProjects();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  });

  /**
   * 页面首次加载时自动刷新数据
   */
  useEffect(() => {
    if (isFirstLoad.current) {
      refetch();
      isFirstLoad.current = false;
    }
  }, [refetch]);

  /**
   * 处理下拉刷新
   *
   * @returns {Promise<void>}
   */
  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
      Toast.show({
        icon: 'success',
        content: '刷新成功',
      });
    } catch (error) {
      Toast.show({
        icon: 'fail',
        content: '刷新失败',
      });
    }
  }, [refetch]);

  // 删除训练项目
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteProject(id);
      return response.data;
    },
    onSuccess: () => {
      Toast.show({
        icon: 'success',
        content: '删除成功',
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  /**
   * 处理删除确认
   *
   * @param {Project} project - 要删除的项目
   */
  const handleDelete = useCallback(
    (project: Project) => {
      Dialog.confirm({
        content: `确定要删除"${project.name}"吗？`,
        onConfirm: () => {
          deleteMutation.mutate(project.id);
        },
      });
    },
    [deleteMutation],
  );

  /**
   * 处理编辑项目
   *
   * @param {Project} project - 要编辑的项目
   */
  const handleEdit = useCallback(
    (project: Project) => {
      navigate(`/project/edit/${project.id}`);
    },
    [navigate],
  );

  /**
   * 处理项目卡片点击
   *
   * @param {Project} project - 被点击的项目
   */
  const handleCardClick = useCallback(
    (project: Project) => {
      // 判断 latestWorkoutDate 是否为今天
      const todayStr = dayjs().format('YYYY-MM-DD');
      const latestStr = project.latestWorkoutDate
        ? dayjs(project.latestWorkoutDate).format('YYYY-MM-DD')
        : '';
      if (project.latestWorkoutId && latestStr === todayStr) {
        // 如果存在今天的训练记录，进入编辑页面
        navigate(`/workout/edit/${project.latestWorkoutId}`);
      } else {
        // 如果不存在今天的训练记录，进入新增页面
        navigate(
          `/workout/new?projectId=${project.id}&projectName=${encodeURIComponent(project.name)}`,
        );
      }
    },
    [navigate],
  );

  const CATEGORY_OPTIONS_WITH_ALL = [{ label: '所有', value: '' }, ...CATEGORY_OPTIONS];
  const [selectedCategory, setSelectedCategory] = useState('');
  const [workoutDateFilter, setWorkoutDateFilter] = useState('');

  const WORKOUT_DATE_FILTERS = [
    { title: '全部', key: '' },
    { title: '今天', key: 'today' },
    { title: '昨天', key: 'yesterday' },
    { title: '前天', key: 'beforeYesterday' },
    { title: '更早', key: 'earlier' },
  ];

  const getWorkoutDateFilter = (project: Project, filter: string) => {
    if (!filter) return true;
    if (!project.latestWorkoutDate) return filter === 'earlier';
    const today = dayjs().format('YYYY-MM-DD');
    const latest = dayjs(project.latestWorkoutDate).format('YYYY-MM-DD');
    const diffDays = dayjs(today).diff(dayjs(latest), 'day');
    if (filter === 'today') return diffDays === 0;
    if (filter === 'yesterday') return diffDays === 1;
    if (filter === 'beforeYesterday') return diffDays === 2;
    if (filter === 'earlier') return diffDays > 2;
    return true;
  };

  // 根据类别筛选项目
  const filteredProjects = projects
    .filter(p => (selectedCategory ? p.category === selectedCategory : true))
    .filter(p => getWorkoutDateFilter(p, workoutDateFilter));

  // 类别中文映射
  const CATEGORY_LABEL_MAP: Record<string, string> = {
    Chest: '胸',
    Back: '背',
    Shoulders: '肩',
    Arms: '臂',
    Legs: '腿',
    Glutes: '臀',
    Abs: '腹',
    Cardio: '有氧',
    Core: '核心',
  };

  /**
   * 渲染项目卡片
   *
   * @param {Project} project - 项目数据
   * @returns {JSX.Element} 项目卡片
   */
  const renderProjectCard = useCallback(
    (project: Project) => (
      <SwipeAction
        key={project.id}
        rightActions={[
          {
            key: 'edit',
            text: '编辑',
            color: 'primary',
            onClick: e => {
              e.stopPropagation();
              handleEdit(project);
            },
          },
          {
            key: 'delete',
            text: '删除',
            color: 'danger',
            onClick: e => {
              e.stopPropagation();
              handleDelete(project);
            },
          },
        ]}
      >
        <Card
          className="rounded-xl active:opacity-80 cursor-pointer transition-all duration-300 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_16px_48px_rgba(0,0,0,0.12)] hover:-translate-y-0.5"
          style={{ background: '#fff', borderRadius: '0.75rem' }}
          onClick={() => handleCardClick(project)}
        >
          <div className="p-1">
            <div className="flex items-start gap-3">
              {/* 项目图标/封面 */}
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md"
                style={{ background: generateColorFromCategory(project.category) }}
              >
                {CATEGORY_LABEL_MAP[project.category] || project.category}
              </div>

              {/* 项目信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-base text-gray-800 truncate">{project.name}</div>
                </div>

                {project.description && (
                  <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {project.description}
                  </div>
                )}

                {/* 训练天数提示 */}
                <div className="mt-2 text-xs flex items-center gap-1">
                  {project.latestWorkoutDate ? (
                    (() => {
                      const todayStr = dayjs().format('YYYY-MM-DD');
                      const latestStr = project.latestWorkoutDate
                        ? dayjs(project.latestWorkoutDate).format('YYYY-MM-DD')
                        : '';
                      const diffDays = dayjs(todayStr).diff(dayjs(latestStr), 'day');
                      if (latestStr === todayStr) {
                        return (
                          <span className="text-green-600 font-bold flex items-center gap-1">
                            <CheckCircleOutline className="text-base" />
                            今天已训练
                          </span>
                        );
                      } else if (diffDays === 1) {
                        return (
                          <span className="text-blue-600 font-bold flex items-center gap-1">
                            <ClockCircleOutline className="text-base" />
                            昨天训练
                          </span>
                        );
                      } else if (diffDays === 2) {
                        return (
                          <span className="text-blue-400 font-bold flex items-center gap-1">
                            <ClockCircleOutline className="text-base" />
                            前天训练
                          </span>
                        );
                      } else if (diffDays > 2 && diffDays <= 5) {
                        return (
                          <span className="text-orange-500 font-bold flex items-center gap-1">
                            <ClockCircleOutline className="text-base" />
                            {`${diffDays}天前训练`}
                          </span>
                        );
                      } else {
                        return (
                          <span className="text-red-500 font-bold flex items-center gap-1">
                            <CloseCircleOutline className="text-base" />
                            {`${diffDays}天前训练`}
                          </span>
                        );
                      }
                    })()
                  ) : (
                    <span className="text-gray-400 flex items-center gap-1">
                      <MinusCircleOutline className="text-base" />
                      暂无训练记录
                    </span>
                  )}
                </div>

                {/* 训练进度 */}
                {/* 只有 latestWorkoutId 存在且 latestWorkoutDate 是今天才显示进度条 */}
                {project.latestWorkoutId &&
                  (() => {
                    const todayStr = dayjs().format('YYYY-MM-DD');
                    const latestStr = project.latestWorkoutDate
                      ? dayjs(project.latestWorkoutDate).format('YYYY-MM-DD')
                      : '';
                    if (latestStr === todayStr) {
                      return (
                        <div className="mt-2">
                          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                              style={{ width: '100%' }}
                            />
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
              </div>
            </div>
          </div>
        </Card>
      </SwipeAction>
    ),
    [handleCardClick, handleEdit, handleDelete],
  );

  return (
    <div
      className="page-container bg-gradient-to-b from-gray-100 to-gray-200"
      style={{ overflow: 'hidden' }}
    >
      {/* 顶部训练日期筛选 Tabs */}
      <div className="w-full px-2 pt-2 pb-2">
        <div
          className="w-full rounded-xl shadow bg-white"
          style={{
            padding: '2px 8px',
            minHeight: 36,
            boxShadow: '0 4px 18px 0 rgba(30,64,175,0.08)',
            background: '#fff',
          }}
        >
          <Tabs
            activeKey={workoutDateFilter}
            onChange={key => setWorkoutDateFilter(key)}
            stretch
            className="custom-tabs w-full"
            style={
              {
                '--active-line-height': '6px',
                '--active-line-border-radius': '6px',
                '--active-title-color': '#2563eb',
                '--active-line-color': '#2563eb',
                '--title-font-size': '16px',
              } as any
            }
          >
            {WORKOUT_DATE_FILTERS.map(opt => (
              <Tabs.Tab
                title={
                  <span
                    className={
                      workoutDateFilter === opt.key
                        ? 'font-bold text-blue-700 drop-shadow-sm'
                        : 'text-gray-500'
                    }
                    style={{
                      display: 'inline-block',
                      width: '100%',
                      textAlign: 'center',
                      padding: '4px 0',
                      borderRadius: '10px 10px 0 0',
                      fontSize: 15,
                      transition: 'color 0.2s',
                    }}
                  >
                    {opt.title}
                  </span>
                }
                key={opt.key}
              />
            ))}
          </Tabs>
        </div>
      </div>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="flex pl-2 max-w-2xl mx-auto">
          {/* 左侧类别筛选栏 */}
          <div
            className="flex flex-col items-center py-4 px-2 bg-white/80 rounded-lg shadow-md mr-2"
            style={{ minWidth: 80 }}
          >
            {CATEGORY_OPTIONS_WITH_ALL.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedCategory(opt.value)}
                className={`w-14 h-10 mb-2 rounded-xl transition-all font-medium
                  ${
                    selectedCategory === opt.value
                      ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow font-bold scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
                  }
                `}
                style={{
                  outline: selectedCategory === opt.value ? '2px solid #2563eb' : 'none',
                  borderLeft:
                    selectedCategory === opt.value ? '4px solid #2563eb' : '4px solid transparent',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* 右侧项目列表 */}
          <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 170px)' }}>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} animated className="rounded-xl h-24" />
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <ErrorBlock
                  status="empty"
                  description="暂无训练项目"
                  style={{ '--image-height': '160px' }}
                  className="py-8"
                />
                <Button
                  color="primary"
                  className="mt-4"
                  onClick={() => {
                    navigate('/project/new', {
                      state: { initialCategory: selectedCategory || undefined },
                    });
                  }}
                >
                  创建第一个项目
                </Button>
              </div>
            ) : (
              <div className="space-y-2">{filteredProjects.map(renderProjectCard)}</div>
            )}
          </div>
        </div>
      </PullToRefresh>
      <FloatingBubble
        style={{
          '--initial-position-bottom': '100px',
          '--initial-position-right': '24px',
          '--edge-distance': '24px',
        }}
        onClick={() => {
          navigate('/project/new', { state: { initialCategory: selectedCategory || undefined } });
        }}
      >
        <AddOutline fontSize={24} />
      </FloatingBubble>
    </div>
  );
};
