import { Button, Form, Input, NavBar, TextArea } from 'antd-mobile';
import { CloseOutline } from 'antd-mobile-icons';
import { useEffect } from 'react';

import type { CreateProjectRequest, Project } from '../../api/types';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: CreateProjectRequest) => void;
  onCancel: () => void;
}

export const ProjectForm = ({ project, onSubmit, onCancel }: ProjectFormProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (project) {
      form.setFieldsValue({
        name: project.name,
        description: project.description,
      });
    }
  }, [project, form]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit(values);
    });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <NavBar
        onBack={onCancel}
        right={
          <Button fill="none" className="text-[var(--adm-color-text)]" onClick={onCancel}>
            <CloseOutline />
          </Button>
        }
      >
        {project ? '编辑训练项目' : '新增训练项目'}
      </NavBar>

      <div className="flex-1 overflow-auto p-4">
        <Form
          form={form}
          layout="vertical"
          footer={
            <Button block color="primary" size="large" onClick={handleSubmit}>
              保存
            </Button>
          }
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>

          <Form.Item name="description" label="项目描述">
            <TextArea placeholder="请输入项目描述" maxLength={200} rows={3} showCount />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
