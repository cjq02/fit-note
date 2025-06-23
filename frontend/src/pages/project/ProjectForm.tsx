import { Button, Form, Input, NavBar, TextArea } from 'antd-mobile';
import { CloseOutline } from 'antd-mobile-icons';
import { useEffect } from 'react';

import type { CreateProjectRequest, Project } from '@/@typings/types';
import { NumberInput } from '@/components/NumberInput';
import { CATEGORY_OPTIONS } from '@/pages/project/categoryOptions';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: CreateProjectRequest) => void;
  onCancel: () => void;
}

/**
 * 训练项目表单组件
 *
 * @param {ProjectFormProps} props - 组件属性
 * @returns {JSX.Element} 训练项目表单
 */
export const ProjectForm = ({ project, onSubmit, onCancel }: ProjectFormProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (project) {
      form.setFieldsValue({
        name: project.name,
        description: project.description,
        seqNo: project.seqNo,
        category: project.category || '',
      });
    } else {
      form.resetFields();
      form.setFieldValue('category', '');
    }
  }, [project, form]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit(values);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[var(--adm-color-primary-light)] to-white">
      <NavBar
        onBack={handleCancel}
        right={
          <Button fill="none" className="text-[var(--adm-color-text)]" onClick={handleCancel}>
            <CloseOutline />
          </Button>
        }
        className="bg-transparent"
      >
        {project ? '编辑训练项目' : '新增训练项目'}
      </NavBar>

      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
            <Form
              form={form}
              layout="vertical"
              footer={
                <div className="mt-8">
                  <Button
                    block
                    color="primary"
                    size="large"
                    onClick={handleSubmit}
                    className="rounded-full h-12 text-base font-medium shadow-lg shadow-[var(--adm-color-primary)]/20 hover:shadow-xl hover:shadow-[var(--adm-color-primary)]/30 transition-all duration-300"
                  >
                    保存
                  </Button>
                </div>
              }
            >
              <Form.Item
                name="name"
                label={
                  <span className="text-base font-medium text-[var(--adm-color-text)]">
                    项目名称
                  </span>
                }
                rules={[{ required: true, message: '请输入项目名称' }]}
                className="mb-8"
              >
                <Input
                  placeholder="请输入项目名称"
                  className="rounded-xl bg-white border border-[var(--adm-color-text-light)] h-12 text-base px-4 focus:border-[var(--adm-color-primary)] transition-colors duration-200 [&_input]:px-0"
                />
              </Form.Item>

              <Form.Item
                name="category"
                label={
                  <span className="text-base font-medium text-[var(--adm-color-text)]">类别</span>
                }
                rules={[{ required: true, message: '请选择类别' }]}
                className="mb-8"
              >
                <select
                  className="rounded-xl bg-white border border-[var(--adm-color-text-light)] h-12 text-base px-4 focus:border-[var(--adm-color-primary)] transition-colors duration-200 w-full"
                  value={form.getFieldValue('category') || ''}
                  onChange={e => form.setFieldValue('category', e.target.value)}
                >
                  <option value="" disabled>
                    请选择类别
                  </option>
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Form.Item>

              <Form.Item
                name="seqNo"
                label={
                  <span className="text-base font-medium text-[var(--adm-color-text)]">排序</span>
                }
                rules={[{ required: true, message: '请输入排序号' }]}
                className="mb-8"
              >
                <NumberInput
                  value={form.getFieldValue('seqNo')?.toString() || ''}
                  onChange={value => form.setFieldValue('seqNo', value ? parseInt(value) : '')}
                  placeholder="请输入排序号"
                  min={0}
                  step={10}
                  className="rounded-xl bg-white border border-[var(--adm-color-text-light)] focus:border-[var(--adm-color-primary)] transition-colors duration-200"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={
                  <span className="text-base font-medium text-[var(--adm-color-text)]">
                    项目描述
                  </span>
                }
                className="mb-8"
              >
                <TextArea
                  placeholder="请输入项目描述"
                  maxLength={200}
                  rows={3}
                  showCount
                  className="rounded-xl bg-white border border-[var(--adm-color-text-light)] text-base px-4 py-3 focus:border-[var(--adm-color-primary)] transition-colors duration-200"
                />
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};
