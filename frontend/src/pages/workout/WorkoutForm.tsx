import {
  Form,
  Input,
  DatePicker,
  Button,
  Space,
  Card,
  Toast,
  Stepper,
  Picker,
  List,
} from 'antd-mobile';
import { AddOutline, DeleteOutline } from 'antd-mobile-icons';
import dayjs from 'dayjs';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { NavHeader } from '../../components/NavHeader';

const workoutTypes = [
  { label: '力量训练', value: 'strength' },
  { label: '有氧训练', value: 'cardio' },
  { label: '柔韧性训练', value: 'flexibility' },
  { label: '其他', value: 'other' },
];

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
}

export const WorkoutForm = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const datePickerRef = useRef<any>(null);
  const typePickerRef = useRef<any>(null);

  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id: Date.now().toString(),
        name: '',
        sets: 1,
        reps: 1,
      },
    ]);
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(ex => (ex.id === id ? { ...ex, [field]: value } : ex)));
  };

  const onFinish = (values: any) => {
    const formData = {
      ...values,
      exercises: exercises.map(({ id, ...rest }) => rest),
    };
    console.log('表单数据：', formData);
    Toast.show({
      icon: 'success',
      content: '保存成功',
    });
    navigate('/workout');
  };

  return (
    <div className="min-h-screen bg-[var(--adm-color-background)] flex flex-col">
      <NavHeader title="记录训练" />
      <div className="flex-1 p-4 pb-24">
        <Form layout="vertical" footer={null}>
          <Form.Item
            name="date"
            label="训练日期"
            rules={[{ required: true, message: '请选择训练日期' }]}
            trigger="onConfirm"
            onClick={(e, datePickerRef) => {
              datePickerRef.current?.open();
            }}
          >
            <DatePicker ref={datePickerRef}>
              {value => (value ? dayjs(value).format('YYYY-MM-DD') : '请选择日期')}
            </DatePicker>
          </Form.Item>

          <Form.Item
            name="type"
            label="训练类型"
            rules={[{ required: true, message: '请选择训练类型' }]}
            trigger="onConfirm"
            onClick={(e, typePickerRef) => {
              typePickerRef.current?.open();
            }}
          >
            <Picker ref={typePickerRef} columns={[workoutTypes]}>
              {items => items[0]?.label ?? '请选择类型'}
            </Picker>
          </Form.Item>

          <Form.Item
            name="duration"
            label="训练时长（分钟）"
            rules={[{ required: true, message: '请输入训练时长' }]}
          >
            <Stepper min={1} max={300} />
          </Form.Item>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-[var(--adm-color-text)] font-medium">训练项目</div>
              <Button
                fill="none"
                onClick={addExercise}
                style={{ '--text-color': 'var(--adm-color-primary)' }}
              >
                <Space>
                  <AddOutline />
                  <span>添加项目</span>
                </Space>
              </Button>
            </div>

            <List>
              {exercises.map(exercise => (
                <List.Item key={exercise.id}>
                  <Card
                    className="mb-2"
                    style={{
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                      borderRadius: '8px',
                    }}
                  >
                    <Space block direction="vertical" style={{ '--gap': '12px' }}>
                      <Form.Item
                        label="项目名称"
                        rules={[{ required: true, message: '请输入项目名称' }]}
                      >
                        <Input
                          placeholder="项目名称"
                          value={exercise.name}
                          onChange={value => updateExercise(exercise.id, 'name', value)}
                        />
                      </Form.Item>
                      <Form.Item label="组数" rules={[{ required: true, message: '请输入组数' }]}>
                        <Stepper
                          min={1}
                          max={20}
                          value={exercise.sets}
                          onChange={value => updateExercise(exercise.id, 'sets', value)}
                        />
                      </Form.Item>
                      <Form.Item label="次数" rules={[{ required: true, message: '请输入次数' }]}>
                        <Stepper
                          min={1}
                          max={100}
                          value={exercise.reps}
                          onChange={value => updateExercise(exercise.id, 'reps', value)}
                        />
                      </Form.Item>
                      <Button
                        fill="none"
                        onClick={() => removeExercise(exercise.id)}
                        style={{ '--text-color': 'var(--adm-color-danger)' }}
                      >
                        <Space>
                          <DeleteOutline />
                          <span>删除项目</span>
                        </Space>
                      </Button>
                    </Space>
                  </Card>
                </List.Item>
              ))}
            </List>
          </div>
        </Form>
      </div>

      {/* 固定在底部的按钮组 */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[var(--adm-color-border)]"
        style={{
          boxShadow: '0 -1px 6px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() => navigate('/workout')}
            style={{
              '--border-radius': '8px',
              height: '44px',
            }}
          >
            取消
          </Button>
          <Button
            className="flex-1"
            color="primary"
            onClick={() => {
              const form = document.querySelector('form');
              if (form) {
                const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
                form.dispatchEvent(submitEvent);
              }
            }}
            style={{
              '--border-radius': '8px',
              height: '44px',
            }}
          >
            保存
          </Button>
        </div>
      </div>
    </div>
  );
};
