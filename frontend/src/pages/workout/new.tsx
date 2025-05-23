import { Form, Input, DatePicker, InputNumber, Select, Button, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

interface Exercise {
    name: string;
    sets: number;
    reps: number;
    weight: number;
}

export const WorkoutForm = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = (values: any) => {
        console.log('Received values:', values);
        // TODO: 调用 API 保存数据
        navigate('/workout');
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">新增训练记录</h1>
            <Form
                form={form}
                name="workout_form"
                onFinish={onFinish}
                layout="vertical"
            >
                <Form.Item
                    name="date"
                    label="训练日期"
                    rules={[{ required: true, message: '请选择训练日期' }]}
                >
                    <DatePicker style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="type"
                    label="训练类型"
                    rules={[{ required: true, message: '请选择训练类型' }]}
                >
                    <Select>
                        <Option value="strength">力量训练</Option>
                        <Option value="cardio">有氧训练</Option>
                        <Option value="flexibility">柔韧性训练</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="duration"
                    label="训练时长(分钟)"
                    rules={[{ required: true, message: '请输入训练时长' }]}
                >
                    <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>

                <Form.List name="exercises">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'name']}
                                        rules={[{ required: true, message: '请输入训练项目' }]}
                                    >
                                        <Input placeholder="训练项目" />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'sets']}
                                        rules={[{ required: true, message: '请输入组数' }]}
                                    >
                                        <InputNumber min={1} placeholder="组数" />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'reps']}
                                        rules={[{ required: true, message: '请输入次数' }]}
                                    >
                                        <InputNumber min={1} placeholder="次数" />
                                    </Form.Item>
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'weight']}
                                        rules={[{ required: true, message: '请输入重量' }]}
                                    >
                                        <InputNumber min={0} placeholder="重量(kg)" />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    添加训练项目
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            保存
                        </Button>
                        <Button onClick={() => navigate('/workout')}>
                            取消
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
}; 