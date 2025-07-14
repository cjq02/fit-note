import { Button, Popup } from 'antd-mobile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { getWorkoutsGroupByDate } from '@/api/workout.api';
import { WorkoutDayGroup } from './WorkoutDayGroup';

interface WorkoutHistoryDrawerProps {
  visible: boolean;
  onClose: () => void;
  projectId: string | null | undefined;
}

/**
 * 训练历史记录抽屉组件
 *
 * @param {WorkoutHistoryDrawerProps} props - 组件属性
 * @returns {JSX.Element} 历史记录抽屉组件
 */
export const WorkoutHistoryDrawer = ({
  visible,
  onClose,
  projectId,
}: WorkoutHistoryDrawerProps) => {
  const queryClient = useQueryClient();
  const [historyData, setHistoryData] = useState<any>(null);

  // 获取历史记录
  const { data: historyWorkouts } = useQuery({
    queryKey: ['workouts', 'history', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const response = await getWorkoutsGroupByDate({
        projectId: projectId,
        page: 1,
        pageSize: 10,
      });
      return response.data;
    },
    enabled: !!projectId && visible,
  });

  // 监听历史记录数据变化
  useEffect(() => {
    if (historyWorkouts) {
      setHistoryData(historyWorkouts);
    }
  }, [historyWorkouts]);

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="right"
      bodyStyle={{ width: '80vw', height: '100vh' }}
    >
      <div className="h-full overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">历史记录</h3>
            <Button fill="none" onClick={onClose} className="text-[var(--adm-color-text-light)]">
              关闭
            </Button>
          </div>
          {historyData &&
            Object.entries(historyData.data).map(([date, workouts]) => (
              <WorkoutDayGroup
                key={date}
                date={date}
                workouts={workouts as any[]}
                onDeleteSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ['workouts', 'history', projectId] });
                }}
                disableClick
              />
            ))}
        </div>
      </div>
    </Popup>
  );
};
