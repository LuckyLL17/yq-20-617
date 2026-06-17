import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Button, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../../services/api';

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

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/clients/${id}`);
      setClient(response.data);
    } catch (error) {
      console.error('加载客户详情失败', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!client) {
    return <div>客户不存在</div>;
  }

  const caseColumns = [
    { title: '案件编号', dataIndex: 'caseNumber', key: 'caseNumber' },
    { title: '案件名称', dataIndex: 'title', key: 'title' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>
          {statusLabels[status] || status}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    }
  ];

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/clients')}
        style={{ marginBottom: 16 }}
      >
        返回客户列表
      </Button>

      <Card title={client.name} style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="客户类型">{client.type}</Descriptions.Item>
          <Descriptions.Item label="联系人">{client.contactPerson || '-'}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{client.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{client.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="统一社会信用代码">{client.idNumber || '-'}</Descriptions.Item>
          <Descriptions.Item label="地址">{client.address || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="关联案件">
        <Table
          columns={caseColumns}
          dataSource={client.cases}
          rowKey="id"
          pagination={false}
          onRow={(record: any) => ({
            onClick: () => navigate(`/cases/${record.id}`),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>
    </div>
  );
}
