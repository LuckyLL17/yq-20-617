import { ReactNode, useState } from 'react';
import { Layout as AntLayout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  BarChartOutlined,
  LogoutOutlined,
  SolutionOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Header, Content, Sider } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();

  const isClient = user?.role === 'CLIENT';

  const menuItems = isClient
    ? [
        {
          key: '/cases',
          icon: <FileTextOutlined />,
          label: '我的案件'
        }
      ]
    : [
        {
          key: '/',
          icon: <DashboardOutlined />,
          label: '仪表盘'
        },
        {
          key: '/cases',
          icon: <FileTextOutlined />,
          label: '案件管理'
        },
        {
          key: '/lawyers',
          icon: <SolutionOutlined />,
          label: '律师列表'
        },
        {
          key: '/clients',
          icon: <TeamOutlined />,
          label: '客户管理'
        },
        ...(hasRole(['ADMIN']) ? [{
          key: '/users',
          icon: <UserOutlined />,
          label: '用户管理'
        }] : []),
        ...(hasRole(['ADMIN', 'FINANCE']) ? [{
          key: '/billing',
          icon: <DollarOutlined />,
          label: '费用结算'
        }] : []),
        ...(hasRole(['ADMIN', 'FINANCE']) ? [{
          key: '/performance',
          icon: <BarChartOutlined />,
          label: '绩效分配'
        }] : [])
      ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo">{collapsed ? '案管' : '案件管理平台'}</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <AntLayout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>案件全生命周期管理平台</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>欢迎，{user?.name}</span>
            <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
              <LogoutOutlined /> 退出
            </a>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: colorBgContainer, borderRadius: borderRadiusLG }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
