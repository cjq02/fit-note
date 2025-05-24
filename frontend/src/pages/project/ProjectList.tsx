import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Dialog, Empty, Popup, Toast, Skeleton, PullToRefresh } from 'antd-mobile';
import { AddOutline, DeleteOutline, EditSOutline, StarOutline } from 'antd-mobile-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createProject, deleteProject, getProjects, updateProject } from '@/api/project.api';
import type { CreateProjectRequest, Project } from '@/@typings/types.d.ts';
import { NavHeader } from '@/components/NavHeader';
import { ProjectForm } from './ProjectForm';

/**
 * 训练项目列表页面组件
 *
 * @returns {JSX.Element} 项目列表页面
 */
export const ProjectList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const isFirstLoad = useRef(true);

  // 获取训练项目列表
  const {
    data: projects = [],
    isLoading,
    refetch,
  } = useQuery({
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
        navigate(`/workout/${project.todayWorkoutId}`);
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
      <Card
        key={project.id}
        className="rounded-xl shadow-lg active:opacity-80 cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
        onClick={() => handleCardClick(project)}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-medium text-lg text-gray-800">{project.name}</div>
                {project.todayWorkoutId && (
                  <StarOutline className="text-yellow-500 animate-pulse" />
                )}
              </div>
              {project.description && (
                <div className="text-sm text-gray-500 mt-2 line-clamp-2">{project.description}</div>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <Button
                fill="none"
                size="mini"
                className="text-blue-500 hover:bg-blue-50 rounded-full"
                onClick={e => {
                  e.stopPropagation();
                  handleEdit(project);
                }}
              >
                <EditSOutline />
              </Button>
              <Button
                fill="none"
                size="mini"
                className="text-red-500 hover:bg-red-50 rounded-full"
                onClick={e => {
                  e.stopPropagation();
                  handleDelete(project);
                }}
              >
                <DeleteOutline />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    ),
    [handleCardClick, handleEdit, handleDelete],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <NavHeader
        title="训练项目"
        rightContent={
          <Button
            fill="none"
            className="text-blue-500 hover:bg-blue-50 rounded-full"
            onClick={() => setShowForm(true)}
          >
            <AddOutline />
          </Button>
        }
      />
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
              <Empty description="暂无训练项目" imageStyle={{ width: 160 }} className="py-8" />
              <Button color="primary" className="mt-4" onClick={() => setShowForm(true)}>
                创建第一个项目
              </Button>
            </div>
          ) : (
            <div className="space-y-4">{projects.map(renderProjectCard)}</div>
          )}
        </div>
      </PullToRefresh>

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
