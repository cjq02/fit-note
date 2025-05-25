import { Card, List, SwipeAction } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';

import type { Workout as WorkoutType } from '@/@typings/types.d.ts';

/**
 * 计算训练项目的总训练量（组数 × 次数）
 *
 * @param {WorkoutType[]} workouts - 当前日期的训练记录
 * @param {string} project - 训练项目名称
 * @returns {number} 总训练量
 */
const calculateProjectTotal = (workouts: WorkoutType[], project: string): number => {
  return workouts
    .filter(workout => workout.project === project)
    .reduce((total, workout) => {
      // 计算每组的总次数
      const groupTotal = workout.groups.reduce((sum, group) => sum + group.reps, 0);
      return total + groupTotal;
    }, 0);
};

interface WorkoutItemProps {
  workout: WorkoutType;
  workouts: WorkoutType[];
  onDelete: (id: string) => void;
}

/**
 * 训练记录项组件
 *
 * @param {WorkoutItemProps} props - 组件属性
 * @returns {JSX.Element} 训练记录项
 */
export const WorkoutItem = ({ workout, workouts, onDelete }: WorkoutItemProps) => {
  const navigate = useNavigate();

  /**
   * 处理编辑训练记录
   *
   * @param {string} id - 训练记录ID
   */
  const handleEdit = (id: string) => {
    navigate(`/workout/edit/${id}`);
  };

  const rightActions = [
    {
      key: 'delete',
      text: '删除',
      color: 'danger',
      onClick: () => onDelete(workout.id),
    },
  ];

  return (
    <SwipeAction rightActions={rightActions}>
      <List.Item className="[&_.adm-list-item-content-main]:!py-1">
        <Card
          className="w-full transition-all duration-200 active:scale-[0.98]"
          style={{
            borderRadius: '16px',
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
            backdropFilter: 'blur(10px)',
            marginBottom: '2px',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
          }}
          onClick={() => handleEdit(workout.id)}
        >
          <div className="flex flex-col gap-3">
            {/* 项目名称和总训练量 */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-sky-500 rounded-full"></div>
                <div>
                  <div className="font-semibold text-gray-800 text-[16px] tracking-wide">
                    {workout.project}
                  </div>
                </div>
              </div>
              <div className="text-blue-500 font-medium">
                <span className="text-sm bg-gradient-to-r from-blue-500 to-sky-500 text-white px-4 py-1.5 rounded-full shadow-sm">
                  {calculateProjectTotal(workouts, workout.project)}次
                </span>
              </div>
            </div>

            {/* 训练组信息 */}
            <div className="flex gap-2 flex-wrap">
              {workout.groups.map((group, index) => (
                <div
                  key={index}
                  className="text-xs text-blue-600 bg-gradient-to-r from-blue-50 to-sky-50 px-3 py-1.5 rounded-full border border-blue-100 shadow-sm"
                >
                  {group.seqNo}组: {group.weight}
                  {workout.unit} × {group.reps}次
                </div>
              ))}
            </div>
          </div>
        </Card>
      </List.Item>
    </SwipeAction>
  );
};
