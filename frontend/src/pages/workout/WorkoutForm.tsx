/// <reference lib="dom" />
import { Button, CalendarPicker, Dialog, Form, SwipeAction, Toast } from 'antd-mobile';
import { AddOutline, HistogramOutline } from 'antd-mobile-icons';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  ApiResponse,
  CreateWorkoutRequest,
  Workout,
  WorkoutGroup,
} from '@/@typings/types.d.ts';
import { createWorkout, findByDateAndProject, getWorkout, updateWorkout } from '@/api/workout.api';
import { NumberInput } from '@/components/NumberInput';
import { WorkoutHistoryDrawer } from './components/WorkoutHistoryDrawer';
import PageSelect from '@/components/PageSelect';
import { UNIT_OPTIONS, EQUIPMENT_OPTIONS } from '@fit-note/shared-utils/dict.options';
import { getProject } from '@/api/project.api';
import { Tag } from 'antd-mobile';

// 添加NodeJS类型定义
declare global {
  namespace NodeJS {
    interface Timeout {}
  }
}

/**
 * 训练记录表单
 *
 * @returns {JSX.Element} 训练记录表单组件
 */
export const WorkoutForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams, _setSearchParams] = useSearchParams();
  const location = useLocation();

  // 获取来源页面
  const fromPage = location.state?.from || 'project';

  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [date, setDate] = useState<Date>(() => {
    const urlDate = searchParams.get('date');
    return urlDate ? new Date(urlDate) : new Date();
  });
  const [unit, setUnit] = useState<string>('自重');
  const [dateVisible, setDateVisible] = useState(false);
  const [_restTime, setRestTime] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  const [_isPaused, setIsPaused] = useState(false);
  const [trainingTime, setTrainingTime] = useState<number>(0);
  const [isTraining, setIsTraining] = useState(false);
  const trainingTimerRef = useRef<number | null>(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [projectDescription, setProjectDescription] = useState<string>('');

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
  const { data: dateWorkoutData } = useQuery<Workout | null, Error>({
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
      setUnit(workout.unit || '自重');
      setTrainingTime(workout.trainingTime || 0);
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
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
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

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 开始训练计时
  const handleStartTraining = () => {
    if (isTraining) {
      // 如果正在训练，暂停计时
      if (trainingTimerRef.current) {
        window.clearInterval(trainingTimerRef.current);
        trainingTimerRef.current = null;
      }
      setIsTraining(false);
    } else {
      // 开始或继续计时
      setIsTraining(true);
      trainingTimerRef.current = window.setInterval(() => {
        setTrainingTime(prev => prev + 1);
      }, 1000);
    }
  };

  /**
   * 提交表单
   *
   * @returns {Promise<void>} 无返回值
   */
  const onFinish = async () => {
    if (isTraining) {
      Dialog.show({
        content: '训练计时还在进行，是否暂停计时并保存？',
        closeOnAction: true,
        actions: [
          {
            key: 'cancel',
            text: '取消保存',
            onClick: () => {
              // 什么都不做，直接关闭弹窗
            },
          },
          {
            key: 'noPause',
            text: '不暂停，直接保存',
            bold: false,
            onClick: async () => {
              await handleSave();
            },
          },
          {
            key: 'pauseAndSave',
            text: '暂停并保存',
            bold: true,
            onClick: async () => {
              setIsTraining(false);
              if (trainingTimerRef.current) {
                window.clearInterval(trainingTimerRef.current);
                trainingTimerRef.current = null;
              }
              await handleSave();
            },
          },
        ],
      });
      return;
    }
    await handleSave();
  };

  // 新增 handleSave 方法，原 onFinish 逻辑迁移到这里
  const handleSave = async () => {
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
      trainingTime,
      groups: groups.map(g => ({
        reps: parseInt(g.reps, 10),
        weight: parseFloat(g.weight),
        seqNo: g.seqNo,
        restTime: g.restTime || 0,
      })),
    };

    console.log('提交 workout 数据：', data);

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
    if (isTraining) {
      Dialog.confirm({
        content: '训练计时未结束，确定要关闭吗？',
        onConfirm: () => {
          setIsTraining(false); // 可选：顺便停止计时
          navigate(fromPage === 'project' ? '/project' : '/workout', { replace: true });
        },
      });
      return;
    }
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

  // 监听视口大小变化
  useEffect(() => {
    const updateHeight = () => {
      const newVh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${newVh}px`);
    };

    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);

    // 初始化高度
    updateHeight();

    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const rootRef = useRef(null);
  const initialHeightRef = useRef(window.innerHeight);
  // 新增：滚动容器ref
  const scrollContainerRef = useRef<any>(null);

  // 监听键盘弹出
  useEffect(() => {
    if (!rootRef.current) return;

    const resizeObserver = new window.ResizeObserver(_entries => {
      const currentHeight = window.innerHeight;
      const heightDiff = initialHeightRef.current - currentHeight;

      // 如果高度差大于 150px，认为是键盘弹出
      if (heightDiff > 150) {
        setIsKeyboardVisible(true);
        setKeyboardHeight(heightDiff);
        console.log('键盘弹出', {
          currentHeight,
          initialHeight: initialHeightRef.current,
          heightDiff,
          isKeyboardVisible: true,
        });
      } else {
        setIsKeyboardVisible(false);
        setKeyboardHeight(0);
        console.log('键盘收起', {
          currentHeight,
          initialHeight: initialHeightRef.current,
          heightDiff,
          isKeyboardVisible: false,
        });
      }
    });

    // 监听窗口大小变化
    const handleResize = () => {
      initialHeightRef.current = window.innerHeight;
      console.log('窗口大小变化', {
        newHeight: window.innerHeight,
        initialHeight: initialHeightRef.current,
      });
    };

    // 监听输入框聚焦
    const handleFocus = (e: any) => {
      console.log('输入框聚焦', {
        target: e.target,
        type: e.type,
        timestamp: new Date().toISOString(),
      });
    };

    // 监听输入框失焦
    const handleBlur = (e: any) => {
      console.log('输入框失焦', {
        target: e.target,
        type: e.type,
        timestamp: new Date().toISOString(),
      });
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
    };

    // 开始观察
    resizeObserver.observe(rootRef.current);
    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    // 添加调试信息
    console.log('组件挂载，当前视口高度：', window.innerHeight);
    console.log('组件挂载，当前设备像素比：', window.devicePixelRatio);
    console.log('组件挂载，当前用户代理：', window.navigator.userAgent);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  /**
   * 编辑休息时间
   *
   * @param {number} idx - 组的索引
   */
  const handleEditRestTime = (idx: number) => {
    let inputValue = groups[idx].restTime?.toString() || '0';

    Dialog.show({
      title: '编辑休息时间',
      content: (
        <div className="p-4">
          <input
            type="number"
            className="w-full h-[40px] px-3 rounded-lg border border-solid border-[var(--adm-color-border)]"
            defaultValue={inputValue}
            min={0}
            placeholder="请输入休息时间（秒）"
            onChange={e => {
              inputValue = e.target.value;
            }}
          />
        </div>
      ),
      closeOnAction: true,
      actions: [
        [
          {
            key: 'cancel',
            text: '取消',
          },
          {
            key: 'confirm',
            text: '确定',
            bold: true,
            onClick: () => {
              const newTime = parseInt(inputValue, 10);
              if (isNaN(newTime) || newTime < 0) {
                Toast.show({ icon: 'fail', content: '请输入有效的数字' });
                return;
              }
              setGroups(currentGroups => {
                const newGroups = [...currentGroups];
                newGroups[idx] = { ...newGroups[idx], restTime: newTime };
                return newGroups;
              });
            },
          },
        ],
      ],
    });
  };

  // 训练器械状态
  const [equipments, setEquipments] = useState<string[]>([]);
  useEffect(() => {
    if (projectId) {
      getProject(projectId).then(res => {
        setEquipments(res.data?.equipments || []);
      });
    }
  }, [projectId]);

  // 新建训练时，根据projectId获取项目默认单位和默认重量和描述
  useEffect(() => {
    if (projectId && !id) {
      getProject(projectId).then(res => {
        if (res.data) {
          setUnit(res.data.defaultUnit || '自重');
          setGroups([
            { reps: '', weight: res.data.defaultWeight?.toString() || '0', seqNo: 1, isNew: true },
          ]);
          setProjectDescription(res.data.description || '');
        }
      });
    }
  }, [projectId, id]);

  // 编辑训练时，根据projectId获取项目描述
  useEffect(() => {
    if (projectId && id) {
      getProject(projectId).then(res => {
        if (res.data) {
          setProjectDescription(res.data.description || '');
        }
      });
    }
  }, [projectId, id]);

  return (
    <div
      ref={rootRef}
      className="min-h-[100vh] min-h-[calc(var(--vh,1vh)*100)] bg-[var(--adm-color-background)]"
      style={{
        position: 'relative',
        paddingBottom: '80px',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* 页面内样式，设置.adm-list-item背景色为白色 */}
      <style>{`
        .workout-form .adm-list-item {
          background-color: #fff !important;
          padding-left: 5px !important;
        }
        .workout-form .adm-list-item-content {
          padding-right: 0 !important;
          border-top: none;
        }
      `}</style>
      <div
        ref={scrollContainerRef}
        className="h-full overflow-y-auto overscroll-contain"
        style={{
          height: '100%',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: isKeyboardVisible ? `${keyboardHeight}px` : '0',
        }}
      >
        <div className="p-2 mb-6">
          <Form form={form} layout="vertical" footer={null} className="workout-form">
            {/* 日期和项目名称卡片 */}
            <div className="mb-2 p-2 rounded-xl bg-white shadow-sm">
              <div className="flex gap-3">
                <Form.Item label="训练日期" style={{ flex: 0.8 }}>
                  <div
                    onClick={() => setDateVisible(true)}
                    className="mb-2 h-[40px] leading-[40px] px-3 rounded-lg border-2 border-solid border-gray-400 bg-white active:bg-[var(--adm-color-fill-light)] transition-colors"
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
                <Form.Item label="训练项目" style={{ flex: 1.2 }}>
                  <div
                    className="h-[40px] leading-[40px] pl-3 rounded-lg border-2 border-solid border-gray-400 bg-white text-base whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer"
                    onClick={() => {
                      if (projectDescription) {
                        Dialog.show({
                          title: '项目描述',
                          content: (
                            <div style={{ whiteSpace: 'pre-wrap' }}>{projectDescription}</div>
                          ),
                          closeOnAction: true,
                          actions: [[{ key: 'close', text: '关闭', bold: true }]],
                        });
                      } else {
                        Toast.show({ content: '暂无项目描述', icon: 'info' });
                      }
                    }}
                  >
                    {decodeURIComponent(projectName || '') ||
                      workoutData?.data.projectName ||
                      '新训练'}
                  </div>
                </Form.Item>
              </div>
            </div>

            {/* 训练器械卡片 */}
            {projectId && (
              <div className="mb-2 p-2 rounded-xl bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2 px-3">
                  <span className="text-[var(--adm-color-text)] text-base font-medium">
                    训练器械
                  </span>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {equipments.length === 0 ? (
                      <span className="text-gray-400 text-sm">无</span>
                    ) : (
                      equipments.map(val => {
                        const found = EQUIPMENT_OPTIONS.find(opt => opt.value === val);
                        const label = found ? found.label : val;
                        const color = found && found.color ? found.color : '#e0f2fe';
                        const textColor = found && found.color ? '#fff' : '#2563eb';
                        return (
                          <Tag
                            key={val}
                            color="primary"
                            style={{
                              background: color,
                              color: textColor,
                              border: 'none',
                              fontSize: 14,
                              padding: '4px 14px',
                              borderRadius: 2,
                              fontWeight: 500,
                            }}
                          >
                            {label}
                          </Tag>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 重量单位卡片 */}
            <SwipeAction
              rightActions={[
                {
                  key: 'editTrainingTime',
                  text: (
                    <div className="flex flex-col items-center">
                      <span>修改</span>
                      <span>时间</span>
                    </div>
                  ),
                  color: 'warning',
                  onClick: () => {
                    let inputValue = trainingTime.toString();
                    Dialog.show({
                      title: '编辑训练时间',
                      content: (
                        <div className="p-4">
                          <input
                            type="number"
                            className="w-full h-[40px] px-3 rounded-lg border border-solid border-[var(--adm-color-border)]"
                            defaultValue={inputValue}
                            min={0}
                            placeholder="请输入训练时间（秒）"
                            onChange={e => {
                              inputValue = e.target.value;
                            }}
                          />
                        </div>
                      ),
                      closeOnAction: true,
                      actions: [
                        [
                          { key: 'cancel', text: '取消' },
                          {
                            key: 'confirm',
                            text: '确定',
                            bold: true,
                            onClick: () => {
                              const newTime = parseInt(inputValue, 10);
                              if (isNaN(newTime) || newTime < 0) {
                                Toast.show({ icon: 'fail', content: '请输入有效的数字' });
                                return;
                              }
                              setTrainingTime(newTime);
                            },
                          },
                        ],
                      ],
                    });
                  },
                },
              ]}
            >
              <div className="mb-2 p-4 rounded-xl bg-white shadow-sm">
                <div className="flex gap-4">
                  <div className="flex-[0.8]">
                    <span className="text-[var(--adm-color-text)] text-base block mb-2">
                      训练单位
                    </span>
                    <PageSelect
                      options={UNIT_OPTIONS}
                      value={unit}
                      onChange={val => {
                        setUnit(val as string);
                      }}
                      triggerRender={(selectedLabel, { onClick }) => (
                        <div
                          className="mb-2 h-[40px] leading-[40px] px-3 rounded-lg border-2 border-solid border-gray-400 bg-white active:bg-[var(--adm-color-fill-light)] transition-colors cursor-pointer flex items-center justify-between"
                          onClick={onClick}
                        >
                          <span>{selectedLabel || '请选择'}</span>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ marginLeft: 8 }}
                          >
                            <path
                              d="M5 8L10 13L15 8"
                              stroke="var(--adm-color-primary)"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    />
                  </div>
                  <div className="flex-[1.2]">
                    <span className="text-[var(--adm-color-text)] text-base block mb-2">
                      训练时间
                    </span>
                    <div className="mb-2 h-[40px] leading-[40px] px-0 rounded-lg border-2 border-solid border-gray-400 bg-white flex items-center justify-between overflow-hidden">
                      <span className="flex-1 px-3 text-black">{formatTime(trainingTime)}</span>
                      <Button
                        size="small"
                        color={isTraining ? 'danger' : 'primary'}
                        onClick={handleStartTraining}
                        className="h-[40px] min-w-[60px] rounded-none rounded-r-lg border-l-0 shadow-none text-base"
                        style={{
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          height: 40,
                          marginLeft: 0,
                          padding: '0 18px',
                        }}
                      >
                        {isTraining ? '暂停' : trainingTime > 0 ? '继续' : '开始'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </SwipeAction>

            {/* 训练组列表 */}
            <div className="space-y-2">
              {groups.map((group, idx) => (
                <SwipeAction
                  key={idx}
                  leftActions={[
                    {
                      key: 'delete',
                      text: (
                        <div className="flex flex-col items-center">
                          <span>删除</span>
                        </div>
                      ),
                      color: 'danger',
                      onClick: () => {
                        if (!group.isNew) {
                          Dialog.confirm({
                            content: '确定要删除这组训练记录吗？',
                            onConfirm: () => handleRemoveGroup(idx),
                          });
                        } else {
                          handleRemoveGroup(idx);
                        }
                      },
                    },
                  ]}
                  rightActions={[
                    {
                      key: 'clearTimer',
                      text: (
                        <div className="flex flex-col items-center">
                          <span>清空</span>
                          <span>计时</span>
                        </div>
                      ),
                      color: 'danger',
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
                    {
                      key: 'editTimer',
                      text: (
                        <div className="flex flex-col items-center">
                          <span>编辑</span>
                          <span>计时</span>
                        </div>
                      ),
                      color: 'warning',
                      onClick: () => handleEditRestTime(idx),
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
                    </div>
                    <div className="flex gap-3">
                      <div className="flex flex-col flex-[2]">
                        <span className="text-sm text-[var(--adm-color-text-light)] mb-1">
                          次数
                        </span>
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
                        <span className="text-sm text-[var(--adm-color-text-light)] mb-1">
                          单位
                        </span>
                        <NumberInput
                          value={group.weight}
                          onChange={val => handleGroupChange(idx, 'weight', val)}
                          min={0}
                          max={999}
                          step={1}
                          allowDecimal={true}
                          disabled={unit === '自重'}
                        />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-[var(--adm-color-text-light)] mb-1 mr-4">
                          休息
                        </span>
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
                          className="h-[40px] w-[60px] disabled:opacity-100 disabled:bg-[var(--adm-color-success)] disabled:text-white"
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
            <div className="mt-6 mb-4 flex gap-2">
              <Button
                block
                color="primary"
                onClick={handleAddGroup}
                className="h-[48px] rounded-xl relative overflow-hidden group flex-1"
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
              <Button
                color="primary"
                onClick={() => setHistoryVisible(true)}
                className="h-[48px] w-[48px] rounded-xl flex items-center justify-center"
              >
                <HistogramOutline className="text-xl" />
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* 底部按钮 */}
      <div
        className="bg-white flex gap-3 px-4 py-3 border-t border-gray-200 shadow-lg"
        style={{
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
          position: 'fixed',
          bottom: isKeyboardVisible ? `${keyboardHeight}px` : 0,
          left: 0,
          right: 0,
          height: '60px',
          zIndex: 1000,
          transform: 'translateZ(0)',
          willChange: 'transform',
          WebkitTransform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          WebkitPerspective: 1000,
          transition: 'bottom 0.3s ease',
        }}
      >
        <Button onClick={handleBack} style={{ height: 40, borderRadius: 8 }} className="flex-1">
          关闭
        </Button>
        <Button
          color="primary"
          onClick={onFinish}
          style={{ height: 40, borderRadius: 8 }}
          className="flex-1"
        >
          保存
        </Button>
      </div>

      {/* 历史记录抽屉 */}
      <WorkoutHistoryDrawer
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        projectId={projectId}
      />
    </div>
  );
};
