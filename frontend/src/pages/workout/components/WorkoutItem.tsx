import { Card, Dialog, List, SwipeAction, Toast } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import type { Workout as WorkoutType } from '@/@typings/types.d.ts';
import { deleteWorkout } from '@/api/workout.api';

dayjs.extend(utc);

/**
 * 将秒数转换为 mm:ss 格式
 *
 * @param {number} seconds - 秒数
 * @returns {string} mm:ss 格式的时间字符串
 */
const formatTime = (seconds: number): string => {
  return dayjs.utc(seconds * 1000).format('mm:ss');
};

/**
 * 计算指定项目的总次数
 *
 * @param {WorkoutType[]} workouts - 训练记录列表
 * @param {string} projectName - 项目名称
 * @returns {number} 总次数
 */
const calculateProjectTotal = (workouts: WorkoutType[], projectName: string): number => {
  return workouts
    .filter(workout => workout.projectName === projectName)
    .reduce((total, workout) => {
      // 计算每组的总次数
      const workoutTotal = workout.groups.reduce((groupTotal, group) => groupTotal + group.reps, 0);
      return total + workoutTotal;
    }, 0);
};

interface WorkoutItemProps {
  workout: WorkoutType;
  workouts: WorkoutType[];
  onDeleteSuccess: () => void;
  dateColor: string;
}

/**
 * 训练记录项组件
 *
 * @param {WorkoutItemProps} props - 组件属性
 * @returns {JSX.Element} 训练记录项
 */
export const WorkoutItem = ({
  workout,
  workouts,
  onDeleteSuccess,
  dateColor,
}: WorkoutItemProps) => {
  const navigate = useNavigate();

  /**
   * 处理编辑训练记录
   *
   * @param {string} id - 训练记录ID
   */
  const handleEdit = (id: string) => {
    navigate(`/workout/edit/${id}`);
  };

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
          onDeleteSuccess();
        } catch (error) {
          Toast.show({
            icon: 'fail',
            content: '删除失败',
          });
        }
      },
    });
  };

  const rightActions = [
    {
      key: 'delete',
      text: '删除',
      color: 'danger',
      onClick: () => handleDelete(workout.id),
    },
  ];

  return (
    <SwipeAction rightActions={rightActions}>
      <List.Item className="[&_.adm-list-item-content-main]:!py-1">
        <Card
          className="w-full transition-all duration-200 active:scale-[0.98]"
          style={{
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${dateColor}11 0%, ${dateColor}08 100%)`,
            backdropFilter: 'blur(10px)',
            marginBottom: '2px',
            boxShadow: `0 4px 20px ${dateColor}22`,
            border: `1px solid ${dateColor}22`,
          }}
          onClick={() => handleEdit(workout.id)}
        >
          <div className="flex flex-col gap-3">
            {/* 项目名称和总训练量 */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div
                  className="w-1 h-6 rounded-full"
                  style={{
                    background: `linear-gradient(to bottom, ${dateColor}, ${dateColor}99)`,
                  }}
                />
                <div>
                  <div
                    className="font-semibold text-[16px] tracking-wide"
                    style={{ color: dateColor }}
                  >
                    {workout.projectName}
                  </div>
                  {typeof workout.trainingTime === 'number' && workout.trainingTime > 0 && (
                    <div className="text-xs opacity-75">
                      训练时间：
                      <span className="font-bold text-sm">{formatTime(workout.trainingTime)}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="font-medium">
                <span
                  className="text-base font-semibold text-white px-5 py-2 rounded-full shadow-md"
                  style={{
                    background: `linear-gradient(to right, ${dateColor}, ${dateColor}88)`,
                    boxShadow: `0 2px 8px ${dateColor}44`,
                  }}
                >
                  {calculateProjectTotal(workouts, workout.projectName)}次
                </span>
              </div>
            </div>

            {/* 训练组信息 */}
            <div className="flex gap-2 flex-wrap">
              {workout.groups.map((group, index) => (
                <div
                  key={index}
                  className="text-xs px-3 py-1.5 rounded-full border shadow-sm"
                  style={{
                    color: dateColor,
                    background: `linear-gradient(to right, ${dateColor}08, ${dateColor}15)`,
                    borderColor: `${dateColor}22`,
                  }}
                >
                  {group.seqNo}组: {group.weight}
                  {workout.unit} × <span className="font-bold text-base">{group.reps}</span>次
                  {typeof group.restTime === 'number' && group.restTime > 0 && (
                    <span className="ml-1 text-[10px] opacity-75">
                      (休息<span className="text-sm font-bold">{group.restTime}</span>秒)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </List.Item>
    </SwipeAction>
  );
};
