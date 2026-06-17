import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, Select, Card, message, Popconfirm } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const { Search } = Input;
const { Option } = Select;

const statusColors: Record<string, string> = {
  CONSULTATION: 'blue',
  CONFLICT_CHECK: 'orange',
  PENDING_APPROVAL: 'gold',
  ACTIVE: 'green',
  COURT_HEARING: 'purple',
  SETTLEMENT: 'cyan',
  CLOSED: 'gray',
  CANCELLED: 'red'
};

const statusLabels: Record<string, string> = {
  CONSULTATION: '咨询阶段',
  CONFLICT_CHECK: '利益冲突检索',
  PENDING_APPROVAL: '待审批',
  ACTIVE: '进行中',
  COURT_HEARING: '庭审中',
  SETTLEMENT: '结算中',
  CLOSED: '已结案',
  CANCELLED: '已取消'
};

export default function CaseList() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const { hasRole, user } = useAuth();
  const isClient = user?.role === 'CLIENT';

  useEffect(() => {
    loadCases();
  }, [status]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (status) params.status = status;
      const response = await api.get('/cases', { params });
      setCases(response.data);
    } catch (error) {
      message.error('加载案件列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/cases/${id}`);
      message.success('删除成功');
      loadCases();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const filteredCases = cases.filter(c =>
    c.title.includes(searchText) || c.caseNumber.includes(searchText)
  );

  const columns = [
    {
      title: '案件编号',
      dataIndex: 'caseNumber',
      key: 'caseNumber',
      width: 150
    },
    {
      title: '案件名称',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '案件类型',
      dataIndex: 'caseType',
      key: 'caseType',
      width: 150
    },
    {
      title: '客户',
      dataIndex: ['client', 'name'],
      key: 'client',
      width: 150
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>
          {statusLabels[status] || status}
        </Tag>
      )
    },
    {
      title: '主办律师',
      key: 'lawyers',
      width: 150,
      render: (_: any, record: any) => (
        record.lawyerAssignments?.filter((a: any) => a.isLead).map((a: any) => a.lawyer.name).join(', ') || '-'
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/cases/${record.id}`)}
          >
            查看
          </Button>
          {hasRole(['ADMIN']) && (
            <Popconfirm
              title="确定要删除这个案件吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2>案件管理</h2>
          <Space>
            <Search
              placeholder="搜索案件"
              style={{ width: 250 }}
              onSearch={setSearchText}
              allowClear
            />
            <Select
              placeholder="筛选状态"
              style={{ width: 150 }}
              allowClear
              onChange={setStatus}
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <Option key={key} value={key}>{label}</Option>
              ))}
            </Select>
            {!isClient && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/cases/create')}>
                新建案件
              </Button>
            )}
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={filteredCases}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
