import { Card, Row, Col, Statistic } from 'antd';
import { FireOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';

export const Home = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">健身概览</h1>
            <Row gutter={16}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="本周训练次数"
                            value={3}
                            prefix={<FireOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="总训练时长"
                            value={120}
                            suffix="分钟"
                            prefix={<ClockCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="完成目标"
                            value={75}
                            suffix="%"
                            prefix={<TrophyOutlined />}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}; 