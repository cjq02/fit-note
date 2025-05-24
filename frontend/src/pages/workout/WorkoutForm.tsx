import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, DatePicker, Form, Input, Radio, Toast, SwipeAction } from 'antd-mobile';
import { AddOutline, DeleteOutline } from 'antd-mobile-icons';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import type { ApiResponse, CreateWorkoutRequest, Workout, WorkoutGroup } from '../../api/types';
import { createWorkout, getWorkout, updateWorkout, findByDateAndProject } from '../../api/workout';
import { NavHeader } from '../../components/NavHeader';

const UNIT_OPTIONS = [
  { label: 'kg', value: 'kg' },
  { label: '磅', value: 'lb' },
];

export const WorkoutForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const projectName = searchParams.get('projectName');
  const projectId = searchParams.get('projectId');

  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [date, setDate] = useState<Date>(new Date());
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [dateVisible, setDateVisible] = useState(false);

  // 获取训练记录详情（通过ID）
  const { data: workoutData } = useQuery<ApiResponse<Workout>, Error>({
    queryKey: ['workout', id],
    queryFn: () => getWorkout(id!),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });

  // 根据日期和项目ID查询训练记录
  const { data: dateWorkoutData } = useQuery<Workout | null, Error>({
    queryKey: ['workout', 'date', projectId, dayjs(date).format('YYYY-MM-DD')],
    queryFn: async () => {
      if (!projectId) throw new Error('项目ID不能为空');
      const response = await findByDateAndProject(dayjs(date).format('YYYY-MM-DD'), projectId);
      return response.data?.data || null;
    },
    enabled: !!projectId && !!date,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });

  // 统一处理数据加载
  useEffect(() => {
    const workout = id ? workoutData?.data : dateWorkoutData;
    if (workout) {
      setDate(new Date(workout.date));
      setUnit(workout.unit);
      setGroups(
        workout.groups.map((group: WorkoutGroup) => ({
          reps: group.reps.toString(),
          weight: group.weight.toString(),
          seqNo: group.seqNo,
        })),
      );
    }
  }, [workoutData, dateWorkoutData, id]);

  // 创建训练记录
  const createMutation = useMutation({
    mutationFn: createWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workout', 'date'] });
      Toast.show({ icon: 'success', content: '创建成功' });
      // 重置表单数据
      setGroups([{ reps: '', weight: '', seqNo: 1 }]);
      setDate(new Date());
    },
    onError: (error: any) => {
      Toast.show({ icon: 'fail', content: error.response?.data?.message || '创建失败' });
    },
  });

  // 更新训练记录
  const updateMutation = useMutation({
    mutationFn: updateWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workout', 'date'] });
      queryClient.invalidateQueries({ queryKey: ['workout', id] });
      Toast.show({ icon: 'success', content: '更新成功' });
      // 重置表单数据
      setGroups([{ reps: '', weight: '', seqNo: 1 }]);
      setDate(new Date());
    },
    onError: (error: any) => {
      Toast.show({ icon: 'fail', content: error.response?.data?.message || '更新失败' });
    },
  });

  // 组表单初始值
  const [groups, setGroups] = useState<
    Array<{
      reps: string;
      weight: string;
      seqNo: number;
    }>
  >([{ reps: '', weight: '', seqNo: 1 }]);

  // 处理组的变化
  const handleGroupChange = (index: number, key: 'reps' | 'weight', value: string) => {
    const newGroups = [...groups];
    newGroups[index][key] = value;
    setGroups(newGroups);
  };

  // 添加组
  const handleAddGroup = () => {
    const newSeqNo = groups.length + 1;
    setGroups([...groups, { reps: '', weight: '', seqNo: newSeqNo }]);
  };

  // 删除组
  const handleRemoveGroup = (index: number) => {
    if (groups.length === 1) return;
    const newGroups = groups
      .filter((_, i) => i !== index)
      .map((group, idx) => ({ ...group, seqNo: idx + 1 }));
    setGroups(newGroups);
  };

  // 提交表单
  const onFinish = async () => {
    if (!projectName && !id) {
      Toast.show({ icon: 'fail', content: '项目名称不能为空' });
      return;
    }
    if (groups.some(g => !g.reps || !g.weight)) {
      Toast.show({ icon: 'fail', content: '请填写完整每一组信息' });
      return;
    }

    const data: CreateWorkoutRequest = {
      date: dayjs(date).format('YYYY-MM-DD'),
      project: projectName || workoutData?.data.project || '',
      projectId: projectId || undefined,
      unit,
      groups: groups.map(g => ({
        reps: parseInt(g.reps, 10),
        weight: parseFloat(g.weight),
        seqNo: g.seqNo,
      })),
    };

    if (id) {
      updateMutation.mutate({ ...data, id });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--adm-color-background)]">
      <NavHeader title={id ? '编辑训练' : '记录训练'} />
      <div className="flex-1 p-4 pb-24">
        <Form form={form} layout="vertical" footer={null}>
          {/* 日期和项目名称卡片 */}
          <div className="mb-4 p-4 rounded-xl bg-white shadow-sm">
            <div className="flex gap-3">
              <Form.Item label="训练日期" style={{ flex: 1 }}>
                <div
                  onClick={() => setDateVisible(true)}
                  className="h-[40px] leading-[40px] px-3 rounded-lg border border-solid border-[var(--adm-color-border)] bg-white active:bg-[var(--adm-color-fill-light)] transition-colors"
                >
                  {dayjs(date).format('YYYY-MM-DD')}
                </div>
                <DatePicker
                  visible={dateVisible}
                  value={date}
                  onClose={() => setDateVisible(false)}
                  onConfirm={val => {
                    setDate(val as Date);
                    setDateVisible(false);
                  }}
                  max={new Date()}
                />
              </Form.Item>
              <Form.Item label="项目名称" style={{ flex: 1 }}>
                <div className="h-[40px] leading-[40px] px-3 rounded-lg border border-solid border-[var(--adm-color-border)] bg-[var(--adm-color-fill-light)] text-[var(--adm-color-text-light)]">
                  {decodeURIComponent(projectName || '') ||
                    workoutData?.data.project ||
                    '未选择项目'}
                </div>
              </Form.Item>
            </div>
          </div>

          {/* 重量单位卡片 */}
          <div className="mb-4 p-4 rounded-xl bg-white shadow-sm">
            <Form.Item label="重量单位">
              <Radio.Group value={unit} onChange={val => setUnit(val as 'kg' | 'lb')}>
                <div className="flex gap-4">
                  {UNIT_OPTIONS.map(opt => (
                    <Radio
                      key={opt.value}
                      value={opt.value}
                      className="flex-1 h-[40px] rounded-lg border border-solid border-[var(--adm-color-border)] data-[checked=true]:border-[var(--adm-color-primary)] data-[checked=true]:bg-[var(--adm-color-primary-light)]"
                    >
                      {opt.label}
                    </Radio>
                  ))}
                </div>
              </Radio.Group>
            </Form.Item>
          </div>

          {/* 训练组列表 */}
          <div className="space-y-3">
            {groups.map((group, idx) => (
              <SwipeAction
                key={idx}
                rightActions={
                  groups.length > 1
                    ? [
                        {
                          key: 'delete',
                          text: '删除',
                          color: 'danger',
                          onClick: () => handleRemoveGroup(idx),
                        },
                      ]
                    : []
                }
              >
                <div className="p-4 rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-[var(--adm-color-text)]">
                      第{group.seqNo}组
                    </div>
                    {groups.length > 1 && (
                      <Button
                        color="danger"
                        fill="none"
                        size="mini"
                        onClick={() => handleRemoveGroup(idx)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <DeleteOutline />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-[var(--adm-color-text-light)] mb-1">次数</span>
                      <Input
                        type="digit"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        placeholder="请输入次数"
                        value={group.reps}
                        onChange={val => {
                          // 只允许输入整数
                          const num = parseInt(val.replace(/[^\d]/g, ''), 10);
                          if (!isNaN(num)) {
                            handleGroupChange(idx, 'reps', num.toString());
                          }
                        }}
                        className="h-[40px] rounded-lg"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-[var(--adm-color-text-light)] mb-1">重量</span>
                      <Input
                        type="digit"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        placeholder={`请输入重量(${unit})`}
                        value={group.weight}
                        onChange={val => {
                          // 只允许输入数字和小数点
                          const num = parseFloat(val.replace(/[^\d.]/g, ''));
                          if (!isNaN(num)) {
                            handleGroupChange(idx, 'weight', num.toString());
                          }
                        }}
                        className="h-[40px] rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </SwipeAction>
            ))}
          </div>

          {/* 添加组按钮 */}
          <div className="mt-6 mb-4">
            <Button
              block
              color="primary"
              onClick={handleAddGroup}
              className="h-[56px] rounded-xl relative overflow-hidden group"
              style={
                {
                  '--background-color': 'var(--adm-color-primary)',
                  '--text-color': '#fff',
                  '--border-radius': '12px',
                  '--border-width': '0',
                } as any
              }
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--adm-color-primary)] to-[var(--adm-color-primary-dark)] opacity-90 group-active:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <AddOutline className="text-xl text-white" />
                </div>
                <span className="text-lg font-medium">添加训练组</span>
              </div>
            </Button>
          </div>
        </Form>
      </div>

      {/* 底部按钮 */}
      <div
        className="fixed left-0 right-0 bottom-0 bg-white flex gap-3 px-4 py-3 border-t border-gray-200 shadow-lg z-10"
        style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <Button
          onClick={() => navigate(-1)}
          style={{ height: 48, borderRadius: 12 }}
          className="flex-1"
        >
          取消
        </Button>
        <Button
          color="primary"
          onClick={onFinish}
          style={{ height: 48, borderRadius: 12 }}
          className="flex-1"
        >
          保存
        </Button>
      </div>
    </div>
  );
};
