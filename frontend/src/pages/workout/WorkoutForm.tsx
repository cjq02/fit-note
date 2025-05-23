import { Form, Input, DatePicker, Button, Space, Card, Toast, Stepper, Picker } from 'antd-mobile';
import { AddOutline, MinusCircleOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { PickerValue } from 'antd-mobile/es/components/picker';
import type { FormArrayField, FormArrayOperation } from 'antd-mobile/es/components/form';

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
        Toast.show({
            icon: 'success',
            content: '保存成功',
            afterClose: () => {
                navigate('/workout');
            },
        });
    };

    return (
        <div className="p-4 pb-20 min-h-screen">
            {/* 页面标题 */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-[var(--adm-color-text)]">新增训练记录</h1>
                <p className="text-sm text-[var(--adm-color-text-light)] mt-1">记录你的训练详情</p>
            </div>

            <Form
                form={form}
                name="workout_form"
                onFinish={onFinish}
                layout="vertical"
                footer={
                    <div className="mt-8">
                        <Space block direction="vertical" style={{ '--gap': '12px' }}>
                            <Button
                                block
                                color="primary"
                                size="large"
                                type="submit"
                            >
                                保存
                            </Button>
                            <Button
                                block
                                size="large"
                                onClick={() => navigate('/workout')}
                            >
                                取消
                            </Button>
                        </Space>
                    </div>
                }
            >
                <Card className="mb-4">
                    <Form.Item
                        name="date"
                        label="训练日期"
                        rules={[{ required: true, message: '请选择训练日期' }]}
                        trigger="onConfirm"
                        onClick={(e, datePickerRef) => {
                            datePickerRef.current?.open();
                        }}
                    >
                        <DatePicker>
                            {value => value ? dayjs(value).format('YYYY-MM-DD') : '请选择日期'}
                        </DatePicker>
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="训练类型"
                        rules={[{ required: true, message: '请选择训练类型' }]}
                    >
                        <Picker
                            columns={[
                                [
                                    { label: '力量训练', value: 'strength' },
                                    { label: '有氧训练', value: 'cardio' },
                                    { label: '柔韧性训练', value: 'flexibility' },
                                ]
                            ]}
                        >
                            {(items, { open }) => (
                                <div onClick={open}>
                                    {items[0]?.label ?? '请选择训练类型'}
                                </div>
                            )}
                        </Picker>
                    </Form.Item>

                    <Form.Item
                        name="duration"
                        label="训练时长(分钟)"
                        rules={[{ required: true, message: '请输入训练时长' }]}
                    >
                        <Stepper
                            min={1}
                            step={1}
                        />
                    </Form.Item>
                </Card>

                <Card>
                    <div className="mb-4">
                        <div className="text-[var(--adm-color-text)] font-medium mb-2">训练项目</div>
                        <p className="text-xs text-[var(--adm-color-text-light)]">
                            添加你的训练动作和组数
                        </p>
                    </div>

                    <Form.Array name="exercises">
                        {(fields: FormArrayField[], operation: FormArrayOperation) => {
                            const items = fields.map((field, index) => (
                                <Card key={field.key} className="mb-4">
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        <Form.Item
                                            name={[index, 'name']}
                                            rules={[{ required: true, message: '请输入训练项目' }]}
                                        >
                                            <Input placeholder="训练项目" />
                                        </Form.Item>

                                        <div className="grid grid-cols-3 gap-2">
                                            <Form.Item
                                                name={[index, 'sets']}
                                                rules={[{ required: true, message: '请输入组数' }]}
                                            >
                                                <Stepper
                                                    min={1}
                                                    step={1}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name={[index, 'reps']}
                                                rules={[{ required: true, message: '请输入次数' }]}
                                            >
                                                <Stepper
                                                    min={1}
                                                    step={1}
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                name={[index, 'weight']}
                                                rules={[{ required: true, message: '请输入重量' }]}
                                            >
                                                <Stepper
                                                    min={0}
                                                    step={0.5}
                                                />
                                            </Form.Item>
                                        </div>

                                        <Button
                                            fill="none"
                                            color="danger"
                                            onClick={() => operation.remove(index)}
                                            className="self-end"
                                        >
                                            <MinusCircleOutline className="mr-1" />
                                            删除
                                        </Button>
                                    </Space>
                                </Card>
                            ));

                            return [
                                ...items,
                                <Button
                                    key="add"
                                    block
                                    color="primary"
                                    fill="outline"
                                    onClick={operation.add}
                                    className="mt-4"
                                >
                                    <AddOutline className="mr-1" />
                                    添加训练项目
                                </Button>
                            ];
                        }}
                    </Form.Array>
                </Card>
            </Form>
        </div>
    );
}; 