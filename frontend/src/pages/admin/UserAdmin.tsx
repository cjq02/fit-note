import { useEffect, useState } from 'react';
import { getAllUsers, impersonateUser } from '@/api/auth.api';

/**
 *
 */
export default function UserAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // 获取当前用户信息
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    // 获取所有用户
    getAllUsers()
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('无权限或获取用户失败');
        setLoading(false);
      });
  }, []);

  const handleImpersonate = async (userId: string) => {
    if (!window.confirm('确定要切换为该用户吗？')) return;
    try {
      const res = await impersonateUser(userId);
      if (res.token) {
        localStorage.setItem('token', res.token);
        window.location.reload();
      } else {
        alert('切换失败');
      }
    } catch (e) {
      alert('切换失败');
    }
  };

  if (loading) return <div>加载中...</div>;
  if (error) return <div>{error}</div>;
  if (!currentUser?.isAdmin) return <div>无权限</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>用户管理（管理员）</h2>
      <ul>
        {users.map(u => (
          <li key={u._id} style={{ marginBottom: 8 }}>
            {u.username} {u.isAdmin ? <b>(管理员)</b> : ''}
            {u._id !== currentUser.id && (
              <button style={{ marginLeft: 16 }} onClick={() => handleImpersonate(u._id)}>
                切换为该用户
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
