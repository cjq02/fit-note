import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, CalendarPicker, Dialog, Form, Radio, SwipeAction, Toast } from 'antd-mobile';
import { AddOutline, DeleteOutline } from 'antd-mobile-icons';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import type {
  ApiResponse,
  CreateWorkoutRequest,
  Workout,
  WorkoutGroup,
} from '@/@typings/types.d.ts';
import { createWorkout, findByDateAndProject, getWorkout, updateWorkout } from '@/api/workout.api';
import { NumberInput } from '@/components/NumberInput';

// 添加NodeJS类型定义
declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}

const UNIT_OPTIONS = [
  { label: 'kg', value: 'kg' },
  { label: '磅', value: 'lb' },
];

/**
 * 训练记录表单
 *
 * @returns {JSX.Element} 训练记录表单组件
 */
export const WorkoutForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // 获取来源页面
  const fromPage = location.state?.from || 'project';

  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [date, setDate] = useState<Date>(() => {
    const urlDate = searchParams.get('date');
    return urlDate ? new Date(urlDate) : new Date();
  });
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');
  const [dateVisible, setDateVisible] = useState(false);
  const [restTime, setRestTime] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // 计算三个月前的日期作为最小值
  const oneMonthAgo = dayjs().subtract(1, 'month').toDate();

  // 获取训练记录详情（通过ID）
  const { data: workoutData } = useQuery<ApiResponse<Workout>, Error>({
    queryFn: () => getWorkout(id!),
    queryKey: ['workout', id],
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });

  // 根据当前页面类型获取 projectId
  const projectId = id ? workoutData?.data?.projectId : searchParams.get('projectId');
  const projectName = id ? workoutData?.data?.projectName : searchParams.get('projectName');

  // 根据日期和项目ID查询训练记录
  const { data: dateWorkoutData, refetch: refetchDateWorkout } = useQuery<Workout | null, Error>({
    queryFn: async () => {
      if (!projectId) throw new Error('项目ID不能为空');
      const response = await findByDateAndProject(dayjs(date).format('YYYY-MM-DD'), projectId);
      return response.data || null;
    },
    queryKey: ['workout', 'date', projectId, dayjs(date).format('YYYY-MM-DD')],
    enabled: !!projectId && !!date && !id, // 只在新建页面且有projectId和date时启用查询
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
          restTime: group.restTime || 0,
        })),
      );
    }
  }, [workoutData, dateWorkoutData, id]);

  // 组表单初始值
  const [groups, setGroups] = useState<
    Array<{
      reps: string;
      weight: string;
      seqNo: number;
      isNew?: boolean;
      restTime?: number;
    }>
  >([{ reps: '', weight: '0', seqNo: 1, isNew: true }]);

  // 检查表单是否有修改
  const [isFormModified, setIsFormModified] = useState(false);

  // 监听表单变化
  useEffect(() => {
    const originalData = id ? workoutData?.data : dateWorkoutData;
    if (originalData) {
      const currentData = {
        date: dayjs(date).format('YYYY-MM-DD'),
        unit,
        groups: groups.map(g => ({
          reps: parseInt(g.reps, 10),
          weight: parseFloat(g.weight),
          seqNo: g.seqNo,
        })),
      };
      const originalFormData = {
        date: originalData.date,
        unit: originalData.unit,
        groups: originalData.groups.map(g => ({
          reps: g.reps,
          weight: g.weight,
          seqNo: g.seqNo,
        })),
      };
      setIsFormModified(JSON.stringify(currentData) !== JSON.stringify(originalFormData));
    }
  }, [date, unit, groups, workoutData, dateWorkoutData, id]);

  // 监听浏览器回退事件
  useEffect(() => {
    const handlePopState = () => {
      if (isFormModified) {
        Dialog.confirm({
          content: '表单已修改，确定要放弃修改吗？',
          onConfirm: () => {
            // 根据当前路由路径决定返回目标
            if (location.pathname.includes('/workout/new')) {
              navigate('/project', { replace: true });
            } else {
              navigate('/workout', { replace: true });
            }
          },
        });
      } else {
        // 根据当前路由路径决定返回目标
        if (location.pathname.includes('/workout/new')) {
          navigate('/project', { replace: true });
        } else {
          navigate('/workout', { replace: true });
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, isFormModified, fromPage]);

  // 创建训练记录
  const createMutation = useMutation({
    /**
     * 创建训练记录
     *
     * @param {CreateWorkoutRequest} data - 创建训练记录的请求参数
     * @returns {Promise<ApiResponse<Workout>>} 创建的训练记录
     */
    mutationFn: createWorkout,
    /**
     * 创建成功回调
     *
     * @param response
     */
    onSuccess: response => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workout', 'date'] });
      Toast.show({ icon: 'success', content: '创建成功' });
      // 重置表单数据，但保持当前日期
      setGroups([{ reps: '', weight: '0', seqNo: 1, isNew: true }]);
      // 重定向到编辑页面，替换当前历史记录，并传递来源页面
      navigate(`/workout/edit/${response.data.id}`, {
        replace: true,
        state: { from: fromPage },
      });
    },
    /**
     * 创建失败回调
     *
     * @param {any} error - 错误信息
     */
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
      setGroups([{ reps: '', weight: '0', seqNo: 1, isNew: true }]);
    },
    onError: (error: any) => {
      Toast.show({ icon: 'fail', content: error.response?.data?.message || '更新失败' });
    },
  });

  /**
   * 处理组的变化
   *
   * @param {number} index - 组的索引
   * @param {'reps' | 'weight'} key - 要修改的字段
   * @param {string} value - 新的值
   */
  const handleGroupChange = (index: number, key: 'reps' | 'weight', value: string) => {
    const newGroups = [...groups];
    newGroups[index][key] = value;
    setGroups(newGroups);
  };

  /**
   * 开始/暂停休息计时
   *
   * @param idx
   */
  const handleStartRest = (idx: number) => {
    // 只有最后一组才能计时
    if (idx !== groups.length - 1) {
      return;
    }

    if (timerRef.current) {
      // 如果正在计时，则暂停
      window.clearInterval(timerRef.current);
      timerRef.current = null;
      setIsPaused(true);
    } else {
      // 如果已暂停或未开始，则继续计时
      setIsPaused(false);
      // 如果是第一次开始计时，重置时间
      if (!groups[idx].restTime) {
        setRestTime(0);
      } else {
        setRestTime(groups[idx].restTime);
      }
      timerRef.current = window.setInterval(() => {
        setRestTime(prev => {
          const newTime = prev + 1;
          // 更新组数据中的休息时间
          setGroups(currentGroups => {
            const newGroups = [...currentGroups];
            newGroups[idx] = { ...newGroups[idx], restTime: newTime };
            return newGroups;
          });
          return newTime;
        });
      }, 1000);
    }
  };

  // 添加组
  /**
   * 添加新的训练组
   */
  const handleAddGroup = () => {
    // 如果有正在进行的计时，先终止它
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
      setIsPaused(false);
    }

    const newSeqNo = groups.length + 1;
    // 获取上一组的数据
    const lastGroup = groups[groups.length - 1];
    setGroups([
      ...groups,
      { reps: lastGroup.reps, weight: lastGroup.weight, seqNo: newSeqNo, isNew: true },
    ]);

    // 使用 setTimeout 确保在 DOM 更新后执行滚动
    window.setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);
  };

  /**
   * 删除训练组
   *
   * @param {number} index - 要删除的组的索引
   */
  const handleRemoveGroup = (index: number) => {
    if (groups.length === 1) return;

    // 如果是非新增组，显示确认对话框
    if (!groups[index].isNew) {
      Dialog.confirm({
        content: '确定要删除这组训练记录吗？',
        onConfirm: () => {
          const newGroups = groups
            .filter((_, i) => i !== index)
            .map((group, idx) => ({ ...group, seqNo: idx + 1 }));
          setGroups(newGroups);
        },
      });
    } else {
      // 新增组直接删除
      const newGroups = groups
        .filter((_, i) => i !== index)
        .map((group, idx) => ({ ...group, seqNo: idx + 1 }));
      setGroups(newGroups);
    }
  };

  /**
   * 处理日期变化
   *
   * @param {Date | null | (Date | null)[]} newDate - 新的日期
   */
  const handleDateChange = async (newDate: Date | null | (Date | null)[]) => {
    // CalendarPicker的onChange会返回选中的日期或日期数组
    let selectedDate: Date | null = null;
    if (Array.isArray(newDate)) {
      // 如果是日期范围选择，取第一个日期（或根据需求调整）
      selectedDate = newDate[0];
    } else {
      selectedDate = newDate;
    }

    if (selectedDate) {
      setDate(selectedDate);
    }
    // 隐藏日历选择器
    setDateVisible(false);

    if (projectId && selectedDate) {
      // 确保有projectId和选中的日期才执行后续逻辑
      try {
        const response = await findByDateAndProject(
          dayjs(selectedDate).format('YYYY-MM-DD'),
          projectId,
        );
        const workout = response.data;

        if (workout) {
          // 如果找到记录
          navigate(`/workout/edit/${workout.id}`, {
            replace: false,
            state: { from: fromPage },
          });
        } else {
          // 如果没有找到记录，重定向到新建页面
          const targetDate = dayjs(selectedDate).format('YYYY-MM-DD');
          navigate(
            `/workout/new?projectName=${projectName}&projectId=${projectId}&date=${targetDate}`,
            {
              replace: false,
              state: { from: fromPage },
            },
          );
          // 清空组数据
          setGroups([{ reps: '', weight: '0', seqNo: 1, isNew: true }]);
          // 更新日期状态
          // setDate(newDate); // 已在函数开头设置
        }
      } catch (error) {
        Toast.show({ icon: 'fail', content: '查询失败' });
      }
    }
  };

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  /**
   * 提交表单
   *
   * @returns {Promise<void>} 无返回值
   */
  const onFinish = async () => {
    // 如果有正在进行的计时，先终止它
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
      setIsPaused(false);
    }

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
      projectName: projectName || workoutData?.data.projectName || '',
      projectId: projectId || undefined,
      unit,
      groups: groups.map(g => ({
        reps: parseInt(g.reps, 10),
        weight: parseFloat(g.weight),
        seqNo: g.seqNo,
        restTime: g.restTime || 0,
      })),
    };

    try {
      if (id) {
        await updateMutation.mutateAsync({ ...data, id });
      } else {
        const response = await createMutation.mutateAsync(data);
        // 创建成功后重定向到编辑页面
        navigate(`/workout/edit/${response.data.id}`, {
          replace: true,
          state: { from: fromPage },
        });
      }
    } catch (error: any) {
      Toast.show({
        icon: 'fail',
        content: error.response?.data?.message || (id ? '更新失败' : '创建失败'),
      });
    }
  };

  /**
   * 返回到训练计划页面
   */
  const handleBack = () => {
    if (isFormModified) {
      Dialog.confirm({
        content: '表单已修改，确定要放弃修改吗？',
        onConfirm: () => {
          navigate(fromPage === 'project' ? '/project' : '/workout', { replace: true });
        },
      });
    } else {
      navigate(fromPage === 'project' ? '/project' : '/workout', { replace: true });
    }
  };

  return (
    <div className="page-container bg-[var(--adm-color-background)] flex flex-col h-screen">
      <div className="flex-1 p-4 pb-24 overflow-y-auto">
        <Form form={form} layout="vertical" footer={null}>
          {/* 日期和项目名称卡片 */}
          <div className="mb-4 p-4 rounded-xl bg-white shadow-sm">
            <div className="flex gap-3">
              <Form.Item label="训练日期" style={{ flex: 1 }}>
                <div
                  onClick={() => setDateVisible(true)}
                  className="mb-2 h-[40px] leading-[40px] px-3 rounded-lg border border-solid border-[var(--adm-color-border)] bg-white active:bg-[var(--adm-color-fill-light)] transition-colors"
                >
                  {dayjs(date).format('YYYY-MM-DD')}
                </div>
                <CalendarPicker
                  visible={dateVisible}
                  value={date}
                  onChange={handleDateChange}
                  max={new Date()}
                  min={oneMonthAgo}
                  selectionMode="single"
                  onClose={() => setDateVisible(false)}
                />
              </Form.Item>
              <Form.Item label="项目名称" style={{ flex: 1 }}>
                <div className="h-[40px] leading-[40px] px-3 rounded-lg border border-solid border-[var(--adm-color-border)] bg-[var(--adm-color-fill-light)] text-[var(--adm-color-text-light)]">
                  {decodeURIComponent(projectName || '') ||
                    workoutData?.data.projectName ||
                    '新训练'}
                </div>
              </Form.Item>
            </div>
          </div>

          {/* 重量单位卡片 */}
          <div className="mb-4 p-4 rounded-xl bg-white shadow-sm">
            <div className="flex items-center gap-6">
              <span className="text-[var(--adm-color-text)] whitespace-nowrap">重量单位</span>
              <Radio.Group value={unit} onChange={val => setUnit(val as 'kg' | 'lb')}>
                <div className="flex gap-6">
                  {UNIT_OPTIONS.map(opt => (
                    <Radio
                      key={opt.value}
                      value={opt.value}
                      className="flex-1 h-[32px] rounded-lg data-[checked=true]:bg-[var(--adm-color-primary-light)]"
                    >
                      {opt.label}
                    </Radio>
                  ))}
                </div>
              </Radio.Group>
            </div>
          </div>

          {/* 训练组列表 */}
          <div className="space-y-3">
            {groups.map((group, idx) => (
              <SwipeAction
                key={idx}
                leftActions={[
                  {
                    key: 'delete',
                    text: '删除',
                    color: 'danger',
                    onClick: () => handleRemoveGroup(idx),
                  },
                ]}
                rightActions={[
                  {
                    key: 'clearTimer',
                    text: '清空计时',
                    color: 'warning',
                    onClick: () => {
                      Dialog.confirm({
                        content: '确定要清空这组的休息时间吗？',
                        onConfirm: () => {
                          setGroups(currentGroups => {
                            const newGroups = [...currentGroups];
                            newGroups[idx] = { ...newGroups[idx], restTime: 0 };
                            return newGroups;
                          });
                          // 如果正在计时，停止计时
                          if (timerRef.current) {
                            window.clearInterval(timerRef.current);
                            timerRef.current = null;
                            setIsPaused(false);
                          }
                        },
                      });
                    },
                  },
                ]}
              >
                <div className="p-4 rounded-xl bg-white shadow-sm transition-all hover:shadow-md relative">
                  {group.isNew && (
                    <div className="absolute -right-2 -top-2 w-28 h-28 overflow-hidden">
                      <div className="absolute right-0 top-0 w-28 h-28 bg-[#00B894] transform rotate-45 translate-x-14 -translate-y-14" />
                      <span className="absolute right-4 top-4 text-base text-white font-bold transform rotate-45">
                        NEW
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-[var(--adm-color-text)]">第</span>
                      <span className="font-extrabold text-[var(--adm-color-primary)]">
                        {group.seqNo}
                      </span>
                      <span className="text-[var(--adm-color-text)]">组</span>
                    </div>
                    <Button
                      color="danger"
                      fill="none"
                      size="mini"
                      onClick={() => handleRemoveGroup(idx)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <DeleteOutline />
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col flex-[2]">
                      <span className="text-sm text-[var(--adm-color-text-light)] mb-1">次数</span>
                      <NumberInput
                        value={group.reps}
                        onChange={val => handleGroupChange(idx, 'reps', val)}
                        min={0}
                        max={999}
                        step={1}
                        allowDecimal={false}
                      />
                    </div>
                    <div className="flex flex-col flex-[2]">
                      <span className="text-sm text-[var(--adm-color-text-light)] mb-1">重量</span>
                      <NumberInput
                        value={group.weight}
                        onChange={val => handleGroupChange(idx, 'weight', val)}
                        min={0}
                        max={999}
                        step={0.5}
                        allowDecimal={true}
                      />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-[var(--adm-color-text-light)] mb-1">休息</span>
                      <Button
                        size="small"
                        color={
                          idx === groups.length - 1
                            ? timerRef.current
                              ? 'danger'
                              : 'warning'
                            : 'success'
                        }
                        onClick={() => handleStartRest(idx)}
                        className="h-[40px] w-[60px]"
                        disabled={idx !== groups.length - 1}
                      >
                        {group.restTime && group.restTime > 0 ? `${group.restTime}` : '计时'}
                      </Button>
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
              className="h-[48px] rounded-xl relative overflow-hidden group"
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
        className="sticky bottom-0 left-0 right-0 bg-white flex gap-3 px-4 py-3 border-t border-gray-200 shadow-lg z-10"
        style={{
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingBottom: 'env(safe-area-inset-bottom, 16px)'
        }}
      >
        <Button onClick={handleBack} style={{ height: 48, borderRadius: 12 }} className="flex-1">
          关闭
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
