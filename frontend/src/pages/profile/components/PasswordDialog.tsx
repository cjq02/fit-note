import { FC, useState } from 'react';
import { Dialog, Form, Input, Toast } from 'antd-mobile';

interface PasswordDialogProps {
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: { oldPassword: string; newPassword: string }) => Promise<void>;
}

/**
 *
 * @param root0
 * @param root0.visible
 * @param root0.loading
 * @param root0.onClose
 * @param root0.onSubmit
 * @returns {JSX.Element}
 */
export const PasswordDialog: FC<PasswordDialogProps> = ({
  visible,
  loading,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  const handleChange = (key: 'oldPassword' | 'newPassword' | 'confirmPassword', value: string) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      Toast.show({ content: '请填写完整信息' });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      Toast.show({ content: '两次输入的新密码不一致' });
      return;
    }
    await onSubmit({ oldPassword: form.oldPassword, newPassword: form.newPassword });
  };

  return (
    <Dialog
      visible={visible}
      title="修改密码"
      content={
        <Form layout="horizontal">
          <Form.Item label="旧密码">
            <Input
              type="password"
              value={form.oldPassword}
              onChange={val => handleChange('oldPassword', val)}
              placeholder="请输入旧密码"
            />
          </Form.Item>
          <Form.Item label="新密码">
            <Input
              type="password"
              value={form.newPassword}
              onChange={val => handleChange('newPassword', val)}
              placeholder="请输入新密码"
            />
          </Form.Item>
          <Form.Item label="确认新密码">
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={val => handleChange('confirmPassword', val)}
              placeholder="请再次输入新密码"
            />
          </Form.Item>
        </Form>
      }
      onClose={onClose}
      closeOnAction={false}
      actions={[
        [
          { key: 'cancel', text: '取消' },
          { key: 'ok', text: loading ? '处理中...' : '确定', onClick: handleSubmit },
        ],
      ]}
    />
  );
};
