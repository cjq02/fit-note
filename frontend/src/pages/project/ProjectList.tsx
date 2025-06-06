import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Dialog,
  ErrorBlock,
  FloatingBubble,
  Popup,
  PullToRefresh,
  Skeleton,
  SwipeAction,
  Tag,
  Toast,
} from 'antd-mobile';
import { AddOutline, ClockCircleOutline, StarOutline } from 'antd-mobile-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { CreateProjectRequest, Project } from '@/@typings/types.d.ts';
import { createProject, deleteProject, getProjects, updateProject } from '@/api/project.api';
import { getUserInfo } from '@/api/auth.api';
import { ProjectForm } from './ProjectForm';

/**
 * 训练项目列表页面组件
 *
 * @returns {JSX.Element} 项目列表页面
 */
export const ProjectList = (): React.ReactElement => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const isFirstLoad = useRef(true);

  // 获取用户信息
  const { data: userInfo } = useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      const response = await getUserInfo();
      return response.data.user;
    },
  });

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
  const handleEdit = useCallback((project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  }, []);

  /**
   * 处理表单提交
   *
   * @param {CreateProjectRequest} data - 项目表单数据
   */
  const handleSubmit = useCallback(
    async (data: CreateProjectRequest) => {
      try {
        if (editingProject) {
          await updateProject({ ...data, id: editingProject.id });
          Toast.show({
            icon: 'success',
            content: '更新成功',
          });
        } else {
          await createProject(data);
          Toast.show({
            icon: 'success',
            content: '创建成功',
          });
        }
        setShowForm(false);
        setEditingProject(null);
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      } catch (error) {
        Toast.show({
          icon: 'fail',
          content: '操作失败',
        });
      }
    },
    [editingProject, queryClient],
  );

  /**
   * 处理项目卡片点击
   *
   * @param {Project} project - 被点击的项目
   */
  const handleCardClick = useCallback(
    (project: Project) => {
      if (project.todayWorkoutId) {
        // 如果存在当天的训练记录，进入编辑页面
        navigate(`/workout/edit/${project.todayWorkoutId}`);
      } else {
        // 如果不存在当天的训练记录，进入新增页面
        navigate(
          `/workout/new?projectId=${project.id}&projectName=${encodeURIComponent(project.name)}`,
        );
      }
    },
    [navigate],
  );

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
          className="rounded-xl active:opacity-80 cursor-pointer transition-all duration-300
            bg-white
            shadow-[0_4px_12px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.08)]
            hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_16px_48px_rgba(0,0,0,0.12)]
            hover:-translate-y-0.5"
          onClick={() => handleCardClick(project)}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* 项目图标/封面 */}
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-md">
                {project.name.charAt(0).toUpperCase()}
              </div>

              {/* 项目信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-lg text-gray-800 truncate">{project.name}</div>
                  {project.todayWorkoutId && (
                    <Tag color="warning" className="flex items-center gap-1">
                      <StarOutline className="text-xs" />
                      今日已训练
                    </Tag>
                  )}
                </div>

                {project.description && (
                  <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {project.description}
                  </div>
                )}

                {/* 项目统计信息 */}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <ClockCircleOutline className="text-base" />
                    <span>创建于: {new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  {project.updatedAt !== project.createdAt && (
                    <div className="flex items-center gap-1">
                      <StarOutline className="text-base" />
                      <span>更新于: {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* 训练进度 */}
                {project.todayWorkoutId && (
                  <div className="mt-2">
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </SwipeAction>
    ),
    [handleCardClick, handleEdit, handleDelete],
  );

  return (
    <div className="page-container bg-gradient-to-b from-gray-100 to-gray-200">
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="p-4 max-w-2xl mx-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} animated className="rounded-xl h-24" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ErrorBlock
                status="empty"
                description="暂无训练项目"
                style={{ '--image-height': '160px' }}
                className="py-8"
              />
              <Button color="primary" className="mt-4" onClick={() => setShowForm(true)}>
                创建第一个项目
              </Button>
            </div>
          ) : (
            <div className="space-y-4">{projects.map(renderProjectCard)}</div>
          )}
        </div>
      </PullToRefresh>

      <FloatingBubble
        style={{
          '--initial-position-bottom': '100px',
          '--initial-position-right': '24px',
          '--edge-distance': '24px',
        }}
        onClick={() => setShowForm(true)}
      >
        <AddOutline fontSize={24} />
      </FloatingBubble>

      <Popup
        visible={showForm}
        onMaskClick={() => {
          setShowForm(false);
          setEditingProject(null);
        }}
        position="right"
        bodyStyle={{ width: '80vw' }}
      >
        <ProjectForm
          project={editingProject}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      </Popup>
    </div>
  );
};
