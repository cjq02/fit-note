/* global setTimeout */
import { useEffect, useState } from 'react';
import { getAllUsers, impersonateUser } from '@/api/auth.api';
import { List, Card, Button, Toast, Dialog, Badge, Avatar } from 'antd-mobile';
import { UserOutline, KeyOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

/**
 * 用户管理页面（仅管理员可见）
 *
 * @returns {JSX.Element} 用户管理页
 */
export default function UserAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 获取当前用户信息
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    // 获取所有用户
    getAllUsers()
      .then(res => {
        setUsers(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => {
        setError('无权限或获取用户失败');
        setLoading(false);
      });
  }, []);

  const handleImpersonate = async (userId: string) => {
    Dialog.confirm({
      content: '确定要切换为该用户吗？',
      onConfirm: async () => {
        try {
          const res = await impersonateUser(userId);
          if (res?.data?.token) {
            localStorage.setItem('token', res.data.token);
            Toast.show({ icon: 'success', content: '切换成功，正在跳转首页...' });
            setTimeout(() => navigate('/'), 800);
          } else {
            Toast.show({ icon: 'fail', content: '切换失败' });
          }
        } catch {
          Toast.show({ icon: 'fail', content: '切换失败' });
        }
      },
    });
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>{error}</div>;
  if (!currentUser?.isAdmin) return <div>无权限</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', overflowY: 'auto', maxHeight: '100vh' }}>
      {/* 顶部渐变背景和大标题 */}
      <div
        style={{
          background: 'linear-gradient(90deg, #a18cd1 0%, #fbc2eb 100%)',
          borderRadius: '0 0 32px 32px',
          padding: '32px 0 24px 0',
          marginBottom: 24,
          textAlign: 'center',
          color: '#333',
          boxShadow: '0 4px 16px 0 rgba(161,140,209,0.08)',
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2 }}>用户管理</div>
        <div style={{ fontSize: 15, color: '#666', marginTop: 8 }}>管理员可切换任意用户身份</div>
      </div>
      <Card style={{ borderRadius: 18, boxShadow: '0 2px 12px 0 rgba(161,140,209,0.10)' }}>
        <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
          <List>
            {users.map(u => (
              <List.Item
                key={u._id || u.id || u.username}
                prefix={
                  <Avatar
                    src=""
                    style={{
                      background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
                      color: '#fff',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                    }}
                    fallback={(u.username || '').charAt(0).toUpperCase()}
                  />
                }
                description={
                  u.createdAt && (
                    <div style={{ color: '#888', fontSize: 12, textAlign: 'left' }}>
                      创建于 {dayjs(u.createdAt).format('YYYY-MM-DD')}
                    </div>
                  )
                }
                extra={
                  (u._id || u.id) !== currentUser.id && (
                    <Button
                      size="mini"
                      color="primary"
                      onClick={() => handleImpersonate(u._id || u.id)}
                    >
                      切换身份
                    </Button>
                  )
                }
                style={{ borderRadius: 12, marginBottom: 6 }}
              >
                <span style={{ fontWeight: 500, display: 'inline-flex', alignItems: 'center' }}>
                  {u.username}
                  {u.isAdmin && (
                    <KeyOutline style={{ color: '#faad14', marginLeft: 6, fontSize: 18 }} />
                  )}
                </span>
              </List.Item>
            ))}
          </List>
        </div>
      </Card>
    </div>
  );
}
