import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Statistic,
  Row,
  Col,
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  DatePicker,
  message,
  Tabs
} from 'antd';
import { PlusOutlined, DollarOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const statusColors: Record<string, string> = {
  UNPAID: 'red',
  PARTIAL: 'orange',
  PAID: 'green',
  REFUNDED: 'gray'
};

const statusLabels: Record<string, string> = {
  UNPAID: '未支付',
  PARTIAL: '部分支付',
  PAID: '已支付',
  REFUNDED: '已退款'
};

const feeTypeLabels: Record<string, string> = {
  LEGAL_FEE: '律师费',
  ADVANCE_FEE: '代垫费用',
  ADMIN_FEE: '行政费用',
  OTHER: '其他费用'
};

export default function BillingList() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>({});
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [form] = Form.useForm();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoicesRes, casesRes, overviewRes] = await Promise.all([
        api.get('/billing/invoices'),
        api.get('/cases'),
        api.get('/billing/reports/overview')
      ]);
      setInvoices(invoicesRes.data);
      setCases(casesRes.data);
      setOverview(overviewRes.data);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (values: any) => {
    try {
      await api.post('/billing/invoices', {
        ...values,
        items
      });
      message.success('创建发票成功');
      setIsInvoiceModalOpen(false);
      form.resetFields();
      setItems([]);
      loadData();
    } catch (error) {
      message.error('创建失败');
    }
  };

  const handleRecordPayment = async (values: any) => {
    try {
      await api.post(`/billing/invoices/${selectedInvoice.id}/payments`, {
        ...values,
        paymentDate: values.paymentDate.format('YYYY-MM-DD')
      });
      message.success('登记付款成功');
      setIsPaymentModalOpen(false);
      setSelectedInvoice(null);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error('登记失败');
    }
  };

  const addInvoiceItem = () => {
    setItems([...items, { description: '', feeType: 'LEGAL_FEE', amount: 0 }]);
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeInvoiceItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const invoiceColumns = [
    {
      title: '发票编号',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 150
    },
    {
      title: '案件',
      dataIndex: ['caseItem', 'title'],
      key: 'case',
      ellipsis: true
    },
    {
      title: '金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) => `¥${amount}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>
          {statusLabels[status] || status}
        </Tag>
      )
    },
    {
      title: '开票日期',
      dataIndex: 'issueDate',
      key: 'issueDate',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setSelectedInvoice(record);
              setIsPaymentModalOpen(true);
            }}
          >
            登记付款
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="开票总额"
              value={overview.totalInvoiced || 0}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已收款"
              value={overview.totalPaid || 0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待收款"
              value={overview.outstanding || 0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
              precision={2}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="发票数量"
              value={invoices.length}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="invoices">
          <TabPane tab="发票管理" key="invoices">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3>发票列表</h3>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsInvoiceModalOpen(true)}>
                新建发票
              </Button>
            </div>
            <Table
              columns={invoiceColumns}
              dataSource={invoices}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              expandedRowRender={(record) => (
                <Table
                  columns={[
                    { title: '费用类型', dataIndex: 'feeType', key: 'feeType', render: (t: string) => feeTypeLabels[t] },
                    { title: '描述', dataIndex: 'description', key: 'description' },
                    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                    { title: '单价', dataIndex: 'unitPrice', key: 'unitPrice', render: (v: number) => `¥${v}` },
                    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v}` }
                  ]}
                  dataSource={record.items}
                  rowKey="id"
                  pagination={false}
                />
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal title="新建发票" open={isInvoiceModalOpen} onCancel={() => setIsInvoiceModalOpen(false)} footer={null} width={700}>
        <Form form={form} onFinish={handleCreateInvoice} layout="vertical">
          <Form.Item name="caseId" label="选择案件" rules={[{ required: true }]}>
            <Select>
              {cases.map(c => (
                <Option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="dueDate" label="到期日">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <label>费用明细</label>
              <Button type="dashed" size="small" onClick={addInvoiceItem}>+ 添加项目</Button>
            </div>
            {items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}>
                <Form.Item style={{ marginBottom: 0, flex: 1 }}>
                  <Input
                    placeholder="描述"
                    value={item.description}
                    onChange={e => updateInvoiceItem(index, 'description', e.target.value)}
                  />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0, width: 120 }}>
                  <Select
                    value={item.feeType}
                    onChange={v => updateInvoiceItem(index, 'feeType', v)}
                  >
                    <Option value="LEGAL_FEE">律师费</Option>
                    <Option value="ADVANCE_FEE">代垫费用</Option>
                    <Option value="ADMIN_FEE">行政费用</Option>
                    <Option value="OTHER">其他</Option>
                  </Select>
                </Form.Item>
                <Form.Item style={{ marginBottom: 0, width: 120 }}>
                  <InputNumber
                    placeholder="金额"
                    value={item.amount}
                    onChange={v => updateInvoiceItem(index, 'amount', v)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Button type="text" danger onClick={() => removeInvoiceItem(index)}>删除</Button>
              </div>
            ))}
            <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
              合计: ¥{items.reduce((sum, i) => sum + (i.amount || 0), 0)}
            </div>
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确认创建</Button>
              <Button onClick={() => setIsInvoiceModalOpen(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="登记付款" open={isPaymentModalOpen} onCancel={() => setIsPaymentModalOpen(false)} footer={null}>
        <Form form={form} onFinish={handleRecordPayment} layout="vertical">
          <Form.Item label="发票信息">
            <div>
              <p>发票编号: {selectedInvoice?.invoiceNumber}</p>
              <p>发票金额: ¥{selectedInvoice?.totalAmount}</p>
            </div>
          </Form.Item>
          <Form.Item name="amount" label="付款金额" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="paymentDate" label="付款日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="paymentMethod" label="付款方式" rules={[{ required: true }]}>
            <Select>
              <Option value="银行转账">银行转账</Option>
              <Option value="现金">现金</Option>
              <Option value="支票">支票</Option>
              <Option value="微信支付">微信支付</Option>
              <Option value="支付宝">支付宝</Option>
            </Select>
          </Form.Item>
          <Form.Item name="payer" label="付款人">
            <Input />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确认登记</Button>
              <Button onClick={() => setIsPaymentModalOpen(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
