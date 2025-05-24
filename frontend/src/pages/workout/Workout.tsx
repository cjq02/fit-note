import { Button, Card, Dialog, List, Space, SwipeAction, Tag, Toast } from 'antd-mobile';
import { ClockCircleOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { NavHeader } from '../../components/NavHeader';
import { getWorkoutsGroupByDate, deleteWorkout } from '@/api/workout.api';
import type { Workout } from '@/@typings/types.d.ts';

/**
 * 训练记录页面组件
 *
 * @returns {JSX.Element} 训练记录页面
 */
export const Workout = () => {
  const navigate = useNavigate();

  // 获取按日期分组的训练记录
  const { data: groupedWorkoutsData, refetch } = useQuery({
    queryKey: ['workouts', 'group-by-date'],
    queryFn: async () => {
      const response = await getWorkoutsGroupByDate();
      return response.data;
    },
  });

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
          refetch(); // 重新获取数据
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

  const rightActions = (id: string) => [
    {
      key: 'edit',
      text: '编辑',
      color: 'primary',
      onClick: () => handleEdit(id),
    },
    {
      key: 'delete',
      text: '删除',
      color: 'danger',
      onClick: () => handleDelete(id),
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--adm-color-background)]">
      <NavHeader title="训练记录" />
      <div className="p-4 pb-20">
        {/* 训练记录列表 */}
        {groupedWorkoutsData &&
          Object.entries(groupedWorkoutsData).map(([date, workouts]) => (
            <div key={date} className="mb-6">
              <div className="text-sm text-[var(--adm-color-text-light)] mb-2">{date}</div>
              <List>
                {workouts.map(workout => (
                  <SwipeAction key={workout.id} rightActions={rightActions(workout.id)}>
                    <List.Item>
                      <Card
                        className="w-full"
                        style={{
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          borderRadius: '12px',
                          backgroundColor: '#ffffff',
                          marginBottom: '16px',
                        }}
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {/* 项目名称和单位 */}
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-[var(--adm-color-text)]">
                                {workout.project}
                              </div>
                            </div>
                            <div className="text-[var(--adm-color-text-light)]">
                              <span className="text-sm">{workout.unit}</span>
                            </div>
                          </div>

                          {/* 训练组信息 */}
                          <div className="flex gap-2 flex-wrap mt-2">
                            {workout.groups.map((group, index) => (
                              <Tag key={index} color="primary" fill="outline" className="text-xs">
                                {group.seqNo}组: {group.weight}
                                {workout.unit} × {group.reps}次
                              </Tag>
                            ))}
                          </div>
                        </Space>
                      </Card>
                    </List.Item>
                  </SwipeAction>
                ))}
              </List>
            </div>
          ))}

        {/* 空状态 */}
        {(!groupedWorkoutsData || Object.keys(groupedWorkoutsData).length === 0) && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-[var(--adm-color-text-light)] mb-4">还没有训练记录</div>
            <Button color="primary" onClick={() => navigate('/workout/new')}>
              开始记录
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
