import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  Dialog,
  List,
  Space,
  SwipeAction,
  Tag,
  Toast,
  Form,
  DatePicker,
  Input,
  InfiniteScroll,
  Empty,
} from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useRef, useState, useEffect } from 'react';
import { AddOutline } from 'antd-mobile-icons';

import { deleteWorkout, getWorkoutsGroupByDate } from '@/api/workout.api';
import type { Workout } from '@/@typings/types.d.ts';

interface WorkoutResponse {
  data: Record<string, Workout[]>;
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * 训练记录页面组件
 *
 * @returns {JSX.Element} 训练记录页面
 */
export const Workout = () => {
  const navigate = useNavigate();
  const [searchForm] = Form.useForm();
  const [searchParams, setSearchParams] = useState<{
    date?: string;
    project?: string;
  }>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const hasMore = useRef(true);
  const [allWorkouts, setAllWorkouts] = useState<Record<string, Workout[]>>({});

  // 获取按日期分组的训练记录
  const { data: groupedWorkoutsData, refetch } = useQuery({
    queryKey: ['workouts', 'group-by-date', searchParams, page],
    queryFn: async () => {
      const response = await getWorkoutsGroupByDate({
        ...searchParams,
        page,
        pageSize,
      });
      return response.data;
    },
  });

  // 处理数据加载成功
  const handleDataSuccess = (data: WorkoutResponse | undefined) => {
    if (!data?.data) return;

    if (page === 1) {
      setAllWorkouts(data.data);
    } else {
      // 合并新数据
      const newWorkouts = { ...allWorkouts };
      Object.entries(data.data).forEach(([date, workouts]) => {
        if (newWorkouts[date]) {
          newWorkouts[date] = [...newWorkouts[date], ...workouts];
        } else {
          newWorkouts[date] = workouts;
        }
      });
      setAllWorkouts(newWorkouts);
    }
    hasMore.current = data.hasMore;
  };

  // 监听数据变化
  useEffect(() => {
    if (groupedWorkoutsData) {
      handleDataSuccess(groupedWorkoutsData);
    }
  }, [groupedWorkoutsData]);

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

  /**
   * 处理搜索表单提交
   *
   * @param {object} values - 表单值
   * @param values.date
   * @param values.project
   */
  const handleSearch = (values: { date?: Date; project?: string }) => {
    setSearchParams({
      date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : undefined,
      project: values.project,
    });
    setPage(1);
    setAllWorkouts({});
    hasMore.current = true;
  };

  /**
   * 处理重置搜索
   */
  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({});
    setPage(1);
    setAllWorkouts({});
    hasMore.current = true;
  };

  /**
   * 加载更多数据
   */
  const loadMore = async () => {
    if (!hasMore.current) return;
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
      <div className="flex-1 overflow-y-auto px-3 pb-20">
        {/* 搜索表单 */}
        <Card className="mb-3 sticky top-0 z-10 bg-[var(--adm-color-background)]">
          <Form form={searchForm} onFinish={handleSearch} layout="horizontal" className="p-2">
            <Form.Item name="date" label="日期" className="mb-1">
              <DatePicker>
                {value => (value ? dayjs(value).format('YYYY-MM-DD') : '请选择日期')}
              </DatePicker>
            </Form.Item>
            <Form.Item name="project" label="训练项目" className="mb-1">
              <Input placeholder="请输入训练项目" />
            </Form.Item>
            <div className="flex gap-2 justify-end">
              <Button onClick={handleReset} fill="outline" size="small">
                重置
              </Button>
              <Button color="primary" type="submit" size="small">
                搜索
              </Button>
            </div>
          </Form>
        </Card>

        {/* 训练记录列表 */}
        {Object.entries(allWorkouts).map(([date, workouts]) => (
          <div key={date} className="mb-3">
            <div className="text-xs text-[var(--adm-color-text-light)] mb-1 px-1">{date}</div>
            <List>
              {workouts.map(workout => (
                <SwipeAction key={workout.id} rightActions={rightActions(workout.id)}>
                  <List.Item>
                    <Card
                      className="w-full transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                      style={{
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        marginBottom: '8px',
                      }}
                      onClick={() => handleEdit(workout.id)}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {/* 项目名称和单位 */}
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-[var(--adm-color-text)] text-[15px]">
                              {workout.project}
                            </div>
                          </div>
                          <div className="text-[var(--adm-color-text-light)]">
                            <span className="text-xs">{workout.unit}</span>
                          </div>
                        </div>

                        {/* 训练组信息 */}
                        <div className="flex gap-1.5 flex-wrap mt-1.5">
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
                      </Space>
                    </Card>
                  </List.Item>
                </SwipeAction>
              ))}
            </List>
          </div>
        ))}

        {/* 无限滚动加载 */}
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore.current} />

        {/* 空状态 */}
        {(!allWorkouts || Object.keys(allWorkouts).length === 0) && (
          <div className="flex flex-col items-center justify-center py-8">
            <Empty
              image={<AddOutline className="text-3xl text-[var(--adm-color-light)]" />}
              description="还没有训练记录"
            />
            <Button
              color="primary"
              className="mt-3"
              size="small"
              onClick={() => navigate('/workout/new')}
            >
              开始记录
            </Button>
          </div>
        )}

        {/* 悬浮添加按钮 */}
        <div className="fixed bottom-20 right-3 z-20">
          <Button
            color="primary"
            shape="rounded"
            size="large"
            onClick={() => navigate('/workout/new')}
            className="shadow-md"
          >
            <AddOutline />
          </Button>
        </div>
      </div>
    </div>
  );
};
