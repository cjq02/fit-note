import { Card, List, Tag, Button, Space, SwipeAction, Dialog, Toast } from 'antd-mobile';
import { EditSOutline, DeleteOutline, ClockCircleOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';

interface Workout {
    id: string;
    date: string;
    type: string;
    duration: number;
    exercises: string[];
}

const mockData: Workout[] = [
    {
        id: '1',
        date: '2024-03-20',
        type: '力量训练',
        duration: 60,
        exercises: ['卧推', '深蹲', '硬拉'],
    },
    {
        id: '2',
        date: '2024-03-18',
        type: '有氧训练',
        duration: 45,
        exercises: ['跑步', '跳绳'],
    },
];

export const Workout = () => {
    const navigate = useNavigate();

    const handleDelete = (id: string) => {
        Dialog.confirm({
            content: '确定要删除这条训练记录吗？',
            onConfirm: () => {
                // TODO: 调用删除 API
                Toast.show({
                    icon: 'success',
                    content: '删除成功',
                });
            },
        });
    };

    const handleEdit = (id: string) => {
        // TODO: 跳转到编辑页面
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
        <div className="p-4 pb-20 min-h-screen">
            {/* 页面标题 */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-[var(--adm-color-text)]">训练记录</h1>
                <p className="text-sm text-[var(--adm-color-text-light)] mt-1">记录你的每一次训练</p>
            </div>

            {/* 训练记录列表 */}
            <List>
                {mockData.map((workout) => (
                    <SwipeAction
                        key={workout.id}
                        rightActions={rightActions(workout.id)}
                    >
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
                                    {/* 日期和类型 */}
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium text-[var(--adm-color-text)]">
                                                {workout.type}
                                            </div>
                                            <div className="text-xs text-[var(--adm-color-text-light)] mt-1">
                                                {workout.date}
                                            </div>
                                        </div>
                                        <div className="flex items-center text-[var(--adm-color-primary)]">
                                            <ClockCircleOutline className="mr-1" />
                                            <span className="text-sm">{workout.duration}分钟</span>
                                        </div>
                                    </div>

                                    {/* 训练项目标签 */}
                                    <div className="flex gap-2 flex-wrap mt-2">
                                        {workout.exercises.map((exercise) => (
                                            <Tag
                                                key={exercise}
                                                color="primary"
                                                fill="outline"
                                                className="text-xs"
                                            >
                                                {exercise}
                                            </Tag>
                                        ))}
                                    </div>
                                </Space>
                            </Card>
                        </List.Item>
                    </SwipeAction>
                ))}
            </List>

            {/* 空状态 */}
            {mockData.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-[var(--adm-color-text-light)] mb-4">
                        还没有训练记录
                    </div>
                    <Button
                        color="primary"
                        onClick={() => navigate('/workout/new')}
                    >
                        开始记录
                    </Button>
                </div>
            )}
        </div>
    );
}; 