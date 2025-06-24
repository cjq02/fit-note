import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toast } from 'antd-mobile';
import type { Project, CreateProjectRequest } from '@/@typings/types';
import { getProjects, createProject, updateProject } from '@/api/project.api';
import { ProjectForm } from './ProjectForm';

/**
 * 训练项目表单页面
 * 支持新建和编辑
 *
 * @returns {JSX.Element} 训练项目表单页面
 */
export default function ProjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  // 处理编辑时加载项目数据
  useEffect(() => {
    if (id) {
      setLoading(true);
      getProjects().then(res => {
        const found = res.data.find((p: Project) => p.id === id);
        setProject(found || null);
        setLoading(false);
      });
    } else {
      setProject(null);
    }
  }, [id]);

  // 处理表单提交
  const handleSubmit = async (data: CreateProjectRequest) => {
    try {
      if (project) {
        await updateProject({ ...data, id: project.id });
        Toast.show({ icon: 'success', content: '更新成功' });
      } else {
        await createProject(data);
        Toast.show({ icon: 'success', content: '创建成功' });
      }
      navigate(-1); // 返回上一页
    } catch (error) {
      Toast.show({ icon: 'fail', content: '操作失败' });
    }
  };

  // 取消返回
  const handleCancel = () => {
    navigate(-1);
  };

  // 支持从 location.state 传递 initialCategory
  const initialCategory = (location.state && (location.state as any).initialCategory) || undefined;

  if (loading) return <div className="p-8 text-center text-gray-400">加载中...</div>;

  return (
    <ProjectForm
      project={project}
      initialCategory={initialCategory}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
