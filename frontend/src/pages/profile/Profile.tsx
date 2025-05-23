import { Card, List, Button, Space } from 'antd-mobile';
import { UserOutline, SetOutline, BellOutline, QuestionCircleOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
    const navigate = useNavigate();

    const menuItems = [
        {
            title: '个人信息',
            icon: <UserOutline />,
            onClick: () => navigate('/profile/info'),
        },
        {
            title: '通知设置',
            icon: <BellOutline />,
            onClick: () => navigate('/profile/notifications'),
        },
        {
            title: '系统设置',
            icon: <SetOutline />,
            onClick: () => navigate('/profile/settings'),
        },
        {
            title: '帮助与反馈',
            icon: <QuestionCircleOutline />,
            onClick: () => navigate('/profile/help'),
        },
    ];

    return (
        <div className="p-4 pb-20 min-h-screen">
            {/* 页面标题 */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-[var(--adm-color-text)]">我的</h1>
                <p className="text-sm text-[var(--adm-color-text-light)] mt-1">管理你的个人信息和设置</p>
            </div>

            {/* 用户信息卡片 */}
            <Card className="mb-4">
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div className="flex items-center">
                        <div className="w-16 h-16 rounded-full bg-[var(--adm-color-primary)] bg-opacity-10 flex items-center justify-center">
                            <UserOutline fontSize={32} className="text-[var(--adm-color-primary)]" />
                        </div>
                        <div className="ml-4">
                            <div className="text-lg font-medium text-[var(--adm-color-text)]">健身达人</div>
                            <div className="text-sm text-[var(--adm-color-text-light)]">点击登录账号</div>
                        </div>
                    </div>
                </Space>
            </Card>

            {/* 菜单列表 */}
            <List>
                {menuItems.map((item, index) => (
                    <List.Item
                        key={index}
                        prefix={item.icon}
                        onClick={item.onClick}
                        arrow={true}
                    >
                        {item.title}
                    </List.Item>
                ))}
            </List>

            {/* 退出登录按钮 */}
            <div className="mt-8">
                <Button
                    block
                    color="danger"
                    fill="outline"
                    onClick={() => {
                        // TODO: 处理退出登录
                        console.log('退出登录');
                    }}
                >
                    退出登录
                </Button>
            </div>
        </div>
    );
}; 