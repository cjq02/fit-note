import { Button, Card, Dialog, Empty, List, NavBar, Popup, Radio, Space, Toast } from 'antd-mobile';
import { AddOutline, DeleteOutline, EditSOutline } from 'antd-mobile-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { NavHeader } from '../../components/NavHeader';
import { createProject, deleteProject, getProjects, updateProject } from '../../api/project';
import type { CreateProjectRequest, Project } from '../../api/types';
import { ProjectForm } from './ProjectForm';

export const ProjectList = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // 获取训练项目列表
    const { data: projects = [], isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const response = await getProjects();
            return response.data;
        },
    });

    // 删除训练项目
    const deleteMutation = useMutation({
        mutationFn: deleteProject,
        onSuccess: () => {
            Toast.show({
                icon: 'success',
                content: '删除成功',
            });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });

    // 处理删除确认
    const handleDelete = (project: Project) => {
        Dialog.confirm({
            content: `确定要删除"${project.name}"吗？`,
            onConfirm: () => {
                deleteMutation.mutate(project.id);
            },
        });
    };

    // 处理编辑
    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setShowForm(true);
    };

    // 处理表单提交
    const handleSubmit = async (data: CreateProjectRequest) => {
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
    };

    return (
        <div className="min-h-screen bg-[var(--adm-color-background)]">
            <NavHeader
                title="训练项目"
                rightContent={
                    <Button
                        fill="none"
                        className="text-[var(--adm-color-primary)]"
                        onClick={() => setShowForm(true)}
                    >
                        <AddOutline />
                    </Button>
                }
            />
            <div className="p-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                        <span className="text-[var(--adm-color-text-light)]">加载中...</span>
                    </div>
                ) : projects.length === 0 ? (
                    <Empty
                        description="暂无训练项目"
                        imageStyle={{ width: 128 }}
                        className="py-8"
                    />
                ) : (
                    <List>
                        {projects.map((project: Project) => (
                            <List.Item
                                key={project.id}
                                extra={
                                    <Space>
                                        <Button
                                            fill="none"
                                            className="text-[var(--adm-color-primary)]"
                                            onClick={() => handleEdit(project)}
                                        >
                                            <EditSOutline />
                                        </Button>
                                        <Button
                                            fill="none"
                                            className="text-[var(--adm-color-danger)]"
                                            onClick={() => handleDelete(project)}
                                        >
                                            <DeleteOutline />
                                        </Button>
                                    </Space>
                                }
                            >
                                <div>
                                    <div className="font-medium">{project.name}</div>
                                    {project.description && (
                                        <div className="text-sm text-[var(--adm-color-text-light)] mt-1">
                                            {project.description}
                                        </div>
                                    )}
                                </div>
                            </List.Item>
                        ))}
                    </List>
                )}
            </div>

            {/* 新增/编辑表单弹窗 */}
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