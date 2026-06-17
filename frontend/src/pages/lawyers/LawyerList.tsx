import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Space
} from 'antd';
import {
  SolutionOutlined,
  DollarOutlined,
  TeamOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Search } = Input;
const { Option } = Select;

export default function LawyerList() {
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [department, setDepartment] = useState<string>('');

  useEffect(() => {
    loadLawyers();
  }, []);

  const loadLawyers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/lawyers');
      setLawyers(response.data);
    } catch (error) {
      console.error('加载律师列表失败', error);
    } finally {
      setLoading(false);
    }
  };

  const departments = [...new Set(lawyers.map((l: any) => l.department).filter(Boolean))];

  const filteredLawyers = lawyers.filter((l: any) => {
    const matchSearch = !searchText ||
      l.name.includes(searchText) ||
      l.email.includes(searchText) ||
      l.department?.includes(searchText);
    const matchDept = !department || l.department === department;
    return matchSearch && matchDept;
  });

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (name: string) => <strong>{name}</strong>
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 150,
      render: (dept: string) => dept ? <Tag color="blue">{dept}</Tag> : '-'
    },
    {
      title: '费率',
      dataIndex: 'hourlyRate',
      key: 'hourlyRate',
      width: 120,
      render: (rate: any) => {
        const num = typeof rate === 'object' ? rate?.toNumber?.() : Number(rate);
        return num ? `¥${num}/小时` : '-';
      }
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone: string) => phone || '-'
    }
  ];

  const avgRate = lawyers.length > 0
    ? lawyers.reduce((sum: number, l: any) => {
        const num = typeof l.hourlyRate === 'object' ? l.hourlyRate?.toNumber?.() : Number(l.hourlyRate);
        return sum + (num || 0);
      }, 0) / lawyers.length
    : 0;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="律师总数"
              value={lawyers.length}
              prefix={<SolutionOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="部门数量"
              value={departments.length}
              prefix={<TeamOutlined />}
              suffix="个"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均费率"
              value={avgRate}
              prefix={<DollarOutlined />}
              precision={0}
              suffix="元/小时"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="最高费率"
              value={Math.max(...lawyers.map((l: any) => {
                const num = typeof l.hourlyRate === 'object' ? l.hourlyRate?.toNumber?.() : Number(l.hourlyRate);
                return num || 0;
              }), 0)}
              prefix={<DollarOutlined />}
              precision={0}
              suffix="元/小时"
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2>律师列表</h2>
          <Space>
            <Search
              placeholder="搜索律师姓名/邮箱"
              style={{ width: 250 }}
              onSearch={setSearchText}
              allowClear
            />
            <Select
              placeholder="筛选部门"
              style={{ width: 160 }}
              allowClear
              onChange={setDepartment}
            >
              {departments.map((dept: string) => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={filteredLawyers}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
