import { Button, Card, message, Space } from 'antd';
import { UserOutlined, LockOutlined, CrownOutlined, DollarOutlined, AuditOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const accounts = [
  { label: '管理员', username: 'admin', password: '123456', icon: <CrownOutlined />, color: '#722ed1' },
  { label: '财务', username: 'finance', password: '123456', icon: <DollarOutlined />, color: '#fa8c16' },
  { label: '律师', username: 'lawyer1', password: '123456', icon: <AuditOutlined />, color: '#1890ff' },
  { label: '客户', username: 'client1', password: '123456', icon: <TeamOutlined />, color: '#52c41a' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handleQuickLogin = async (account: typeof accounts[0]) => {
    setLoadingKey(account.username);
    try {
      await login(account.username, account.password);
      message.success(`${account.label}登录成功`);
      navigate('/');
    } catch (error: any) {
      message.error(error.message || error.response?.data?.message || '登录失败');
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card title="案件全生命周期管理平台" style={{ width: 400 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {accounts.map(account => (
            <Button
              key={account.username}
              block
              size="large"
              icon={account.icon}
              loading={loadingKey === account.username}
              onClick={() => handleQuickLogin(account)}
              style={{ height: 48, fontSize: 16 }}
            >
              {account.label}登录
            </Button>
          ))}
        </Space>
      </Card>
    </div>
  );
}
