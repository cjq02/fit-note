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
    <div
      style={{
        maxWidth: 600,
        margin: '0 auto',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 16px 16px 16px',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {users.map(u => (
          <Card
            key={u._id || u.id || u.username}
            style={{
              borderRadius: 12,
              margin: 0,
              padding: 0,
              boxShadow: '0 1px 6px 0 rgba(161,140,209,0.07)',
            }}
            bodyStyle={{ padding: '14px 14px 12px 14px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
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
                <div style={{ marginLeft: 12, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{u.username}</span>
                    {u.isAdmin && (
                      <KeyOutline style={{ color: '#faad14', marginLeft: 6, fontSize: 18 }} />
                    )}
                  </div>
                  {u.createdAt && (
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      创建于 {dayjs(u.createdAt).format('YYYY-MM-DD')}
                    </div>
                  )}
                </div>
              </div>
              {(u._id || u.id) !== currentUser.id && (
                <Button
                  size="mini"
                  color="primary"
                  onClick={() => handleImpersonate(u._id || u.id)}
                >
                  切换身份
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
