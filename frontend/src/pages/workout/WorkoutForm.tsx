import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Radio,
  Space,
  Toast
} from 'antd-mobile';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import type { ApiResponse, CreateWorkoutRequest, Workout, WorkoutGroup } from '../../api/types';
import { createWorkout, getWorkout, updateWorkout } from '../../api/workout';
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

  // 获取训练记录详情
  const { data: workoutData } = useQuery<ApiResponse<Workout>, Error>({
    queryKey: ['workout', id],
    queryFn: () => getWorkout(id!),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    onSettled: (res: ApiResponse<Workout> | undefined) => {
      if (res) {
        const workout = res.data;
        setDate(new Date(workout.date));
        setUnit(workout.unit);
        setGroups(workout.groups.map((g: WorkoutGroup) => ({
          reps: g.reps.toString(),
          weight: g.weight.toString(),
          seqNo: g.seqNo,
        })));
      }
    },
  } as UseQueryOptions<ApiResponse<Workout>, Error>);

  // 创建训练记录
  const createMutation = useMutation({
    mutationFn: createWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      Toast.show({ icon: 'success', content: '创建成功' });
      navigate(-1);
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
      Toast.show({ icon: 'success', content: '更新成功' });
      navigate(-1);
    },
    onError: (error: any) => {
      Toast.show({ icon: 'fail', content: error.response?.data?.message || '更新失败' });
    },
  });

  // 组表单初始值
  const [groups, setGroups] = useState<Array<{
    reps: string;
    weight: string;
    seqNo: number;
  }>>([
    { reps: '', weight: '', seqNo: 1 },
  ]);

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
    const newGroups = groups.filter((_, i) => i !== index).map((group, idx) => ({ ...group, seqNo: idx + 1 }));
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

  // 根据项目 ID 和日期查询训练记录
  useEffect(() => {
    const fetchWorkout = async () => {
      if (projectId && date) {
        const response = await getWorkoutByDate(projectId, dayjs(date).format('YYYY-MM-DD'));
        if (!response.data) {
          // 如果没有记录，跳转到新建页面
          navigate('/new'); // 假设新建页面的路径是 /new
        } else {
          // 如果有记录，加载数据到页面
          const workout = response.data;
          setDate(new Date(workout.date));
          setUnit(workout.unit);
          setGroups(workout.groups.map((g: WorkoutGroup) => ({
            reps: g.reps.toString(),
            weight: g.weight.toString(),
            seqNo: g.seqNo,
          })));
        }
      }
    };

    fetchWorkout();
  }, [projectId, date, navigate]);

  // 新增的查询函数
  const getWorkoutByDate = async (projectId: string, date: string): Promise<{ data: Workout | null }> => {
    // 这里需要实现根据项目 ID 和日期查询训练记录的 API 调用
    // 返回的结果应该是包含训练记录的响应
    return { data: null }; // 示例返回，实际需要替换为 API 调用
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--adm-color-background)]">
      <NavHeader title={id ? '编辑训练' : '记录训练'} />
      <div className="flex-1 p-4 pb-24">
        <Form
          form={form}
          layout="vertical"
          footer={null}
        >
          <div className="flex gap-3 mb-4">
            <Form.Item label="训练日期" style={{ flex: 1 }}>
              <div
                onClick={() => setDateVisible(true)}
                className="h-[32px] leading-[32px] px-3 rounded-lg border border-solid border-[var(--adm-color-border)] bg-white"
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
              <div className="h-[32px] leading-[32px] px-3 rounded-lg border border-solid border-[var(--adm-color-border)] bg-[var(--adm-color-fill-light)] text-[var(--adm-color-text-light)]">
                {decodeURIComponent(projectName || '') || workoutData?.data.project || '未选择项目'}
              </div>
            </Form.Item>
          </div>
          <Form.Item label="重量单位">
            <Radio.Group value={unit} onChange={val => setUnit(val as 'kg' | 'lb')}>
              <div style={{ display: 'flex', gap: 16 }}>
                {UNIT_OPTIONS.map(opt => (
                  <Radio key={opt.value} value={opt.value}>{opt.label}</Radio>
                ))}
              </div>
            </Radio.Group>
          </Form.Item>
          {groups.map((group, idx) => (
            <div key={idx} className="mb-4 p-3 rounded-lg border border-solid border-gray-200 bg-white shadow-sm">
              <div className="font-medium mb-2">第{group.seqNo}组</div>
              <Space direction="vertical" block style={{ width: '100%' }}>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-xs text-gray-500">次数</span>
                  <Input
                    type="number"
                    placeholder="请输入次数"
                    value={group.reps}
                    onChange={val => handleGroupChange(idx, 'reps', val)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-xs text-gray-500">重量</span>
                  <Input
                    type="number"
                    placeholder={`请输入重量(${unit})`}
                    value={group.weight}
                    onChange={val => handleGroupChange(idx, 'weight', val)}
                  />
                </div>
                {groups.length > 1 && (
                  <Button color="danger" fill="none" size="mini" onClick={() => handleRemoveGroup(idx)}>
                    删除本组
                  </Button>
                )}
              </Space>
            </div>
          ))}
          <Button block color="primary" onClick={handleAddGroup} style={{ marginBottom: 16 }}>
            添加组
          </Button>
        </Form>
      </div>
      {/* 底部按钮 */}
      <div
        className="fixed left-0 right-0 bottom-0 bg-white flex gap-3 px-4 py-3 border-t border-gray-200 shadow z-10"
        style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
      >
        <Button
          onClick={() => navigate(-1)}
          style={{ height: 48, borderRadius: 8 }}
          className="flex-1"
        >
          取消
        </Button>
        <Button
          color="primary"
          onClick={onFinish}
          style={{ height: 48, borderRadius: 8 }}
          className="flex-1"
        >
          保存
        </Button>
      </div>
    </div>
  );
};
