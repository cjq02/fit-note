import { Table, Tag, Space, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';

interface Workout {
    id: string;
    date: string;
    type: string;
    duration: number;
    exercises: string[];
}

const columns: ColumnsType<Workout> = [
    {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
    },
    {
        title: '训练类型',
        dataIndex: 'type',
        key: 'type',
    },
    {
        title: '时长(分钟)',
        dataIndex: 'duration',
        key: 'duration',
    },
    {
        title: '训练项目',
        dataIndex: 'exercises',
        key: 'exercises',
        render: (exercises: string[]) => (
            <>
                {exercises.map((exercise) => (
                    <Tag key={exercise}>{exercise}</Tag>
                ))}
            </>
        ),
    },
    {
        title: '操作',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <Button type="text" icon={<EditOutlined />} />
                <Button type="text" danger icon={<DeleteOutlined />} />
            </Space>
        ),
    },
];

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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">训练记录</h1>
                <Button type="primary" onClick={() => navigate('/workout/new')}>
                    新增训练
                </Button>
            </div>
            <Table columns={columns} dataSource={mockData} rowKey="id" />
        </div>
    );
}; 