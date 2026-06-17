import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Select,
  InputNumber,
  message,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Tabs
} from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  CalculatorOutlined,
  BarChartOutlined,
  UserOutlined,
  DollarOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Option } = Select;
const { TabPane } = Tabs;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const toNum = (v: any): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'object' && typeof v.toNumber === 'function') return v.toNumber();
  return Number(v) || 0;
};

export default function PerformanceReport() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<string>('');
  const [caseDetail, setCaseDetail] = useState<any>(null);
  const [shares, setShares] = useState<any[]>([]);
  const [calculatedShares, setCalculatedShares] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [totalFee, setTotalFee] = useState<number>(0);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('calculator');

  useEffect(() => {
    loadCases();
    loadRanking();
  }, []);

  const loadCases = async () => {
    const response = await api.get('/cases');
    setCases(response.data);
  };

  const loadRanking = async () => {
    try {
      const response = await api.get('/performance/reports/ranking', {
        params: { limit: 10 }
      });
      setRanking(response.data);
    } catch (error) {
      console.error('加载排名失败', error);
    }
  };

  const handleCaseChange = async (caseId: string) => {
    setSelectedCase(caseId);
    try {
      const [caseRes, sharesRes] = await Promise.all([
        api.get(`/cases/${caseId}`),
        api.get(`/performance/case/${caseId}`)
      ]);
      setCaseDetail(caseRes.data);
      setShares(sharesRes.data);
    } catch (error) {
      message.error('加载案件数据失败');
    }
  };

  const handleCalculate = async (values: any) => {
    try {
      const response = await api.post(`/performance/calculate/${selectedCase}`, {
        totalFee: values.totalFee
      });
      setCalculatedShares(response.data);
      setTotalFee(values.totalFee);
      setIsCalcModalOpen(false);
      form.resetFields();
      message.success('计算完成');
    } catch (error) {
      message.error('计算失败');
    }
  };

  const handleSaveShares = async () => {
    try {
      await api.post(`/performance/save/${selectedCase}`, {
        shares: calculatedShares
      });
      message.success('保存成功');
      setCalculatedShares([]);
      handleCaseChange(selectedCase);
    } catch (error) {
      message.error('保存失败');
    }
  };

  const columns = [
    { title: '排名', dataIndex: 'rank', key: 'rank', width: 80 },
    { title: '律师', dataIndex: 'lawyerName', key: 'lawyer' },
    { title: '案件数', dataIndex: 'totalCases', key: 'totalCases' },
    { title: '总工时', dataIndex: 'totalHours', key: 'totalHours', render: (v: any) => `${toNum(v)}小时` },
    { title: '总费用', dataIndex: 'totalFee', key: 'totalFee', render: (v: any) => `¥${toNum(v).toFixed(2)}` },
    { title: '平均费率', dataIndex: 'averageHourlyRate', key: 'rate', render: (v: any) => `¥${toNum(v).toFixed(2)}/小时` }
  ];

  const shareColumns = [
    { title: '律师', dataIndex: 'lawyerName', key: 'lawyer' },
    { title: '总工时', dataIndex: 'totalHours', key: 'totalHours', render: (v: any) => `${toNum(v)}小时` },
    { title: '工时占比', dataIndex: 'timeShare', key: 'timeShare', render: (v: any) => `${(toNum(v) * 100).toFixed(1)}%` },
    { title: '贡献度', dataIndex: 'contribution', key: 'contribution', render: (v: any) => `${(toNum(v) * 100).toFixed(1)}%` },
    { title: '分配比例', dataIndex: 'shareRatio', key: 'shareRatio', render: (v: any) => `${(toNum(v) * 100).toFixed(1)}%` },
    { title: '分配金额', dataIndex: 'allocatedFee', key: 'allocatedFee', render: (v: any) => `¥${toNum(v).toFixed(2)}` }
  ];

  const chartData = calculatedShares.map(s => ({
    name: s.lawyerName,
    工时: toNum(s.totalHours),
    分配金额: toNum(s.allocatedFee) / 1000
  }));

  const pieData = calculatedShares.map(s => ({
    name: s.lawyerName,
    value: toNum(s.allocatedFee)
  }));

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="绩效计算器" key="calculator">
          <Card>
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label>选择案件</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择案件"
                  value={selectedCase || undefined}
                  onChange={handleCaseChange}
                  showSearch
                  optionFilterProp="children"
                >
                  {cases.map(c => (
                    <Option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </Option>
                  ))}
                </Select>
              </div>
              {selectedCase && (
                <Button
                  type="primary"
                  icon={<CalculatorOutlined />}
                  onClick={() => setIsCalcModalOpen(true)}
                >
                  计算绩效分配
                </Button>
              )}
            </div>

            {caseDetail && (
              <div style={{ marginBottom: 24 }}>
                <h3>{caseDetail.caseNumber} - {caseDetail.title}</h3>
                <p>客户: {caseDetail.client?.name}</p>
                <p>计费模式: {caseDetail.billingMode}</p>
                <p>已记录工时: {caseDetail.timeEntries?.reduce((sum: number, t: any) => sum + toNum(t.hours), 0) || 0}小时</p>
              </div>
            )}

            {shares.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <h3>已保存的绩效分配</h3>
                <Table
                  columns={shareColumns}
                  dataSource={shares}
                  rowKey="id"
                  pagination={false}
                />
              </div>
            )}

            {calculatedShares.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3>计算结果</h3>
                  <Button type="primary" onClick={handleSaveShares}>保存分配方案</Button>
                </div>

                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="分配总金额"
                        value={totalFee}
                        prefix={<DollarOutlined />}
                        precision={2}
                        suffix="元"
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card>
                      <Statistic
                        title="参与律师"
                        value={calculatedShares.length}
                        prefix={<UserOutlined />}
                        suffix="人"
                      />
                    </Card>
                  </Col>
                </Row>

                <Table
                  columns={shareColumns}
                  dataSource={calculatedShares}
                  rowKey="lawyerId"
                  pagination={false}
                  expandable={{
                    expandedRowRender: () => (
                      <Row gutter={16}>
                        <Col span={12}>
                          <h4>工时 vs 分配金额(千元)</h4>
                          <BarChart width={450} height={300} data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="工时" fill="#8884d8" />
                            <Bar dataKey="分配金额" fill="#82ca9d" />
                          </BarChart>
                        </Col>
                        <Col span={12}>
                          <h4>费用分配占比</h4>
                          <PieChart width={450} height={300}>
                            <Pie
                              data={pieData}
                              cx={225}
                              cy={150}
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </Col>
                      </Row>
                    )
                  }}
                />
              </div>
            )}
          </Card>
        </TabPane>

        <TabPane tab="律师排名" key="ranking">
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2>
                <BarChartOutlined style={{ marginRight: 8 }} />
                绩效排行榜
              </h2>
              <Button onClick={loadRanking}>刷新</Button>
            </div>
            <Table
              columns={columns}
              dataSource={ranking}
              rowKey="lawyerId"
              pagination={false}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="计算绩效分配"
        open={isCalcModalOpen}
        onCancel={() => { setIsCalcModalOpen(false); form.resetFields(); }}
        footer={null}
        destroyOnClose
      >
        <Form form={form} onFinish={handleCalculate} layout="vertical">
          <Form.Item
            name="totalFee"
            label="分配总金额(元)"
            rules={[{ required: true, message: '请输入分配总金额' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <p style={{ color: '#666', fontSize: 12 }}>
            系统将根据工时记录、律师角色、工作类型自动计算每位律师的贡献度和分配比例
          </p>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">开始计算</Button>
              <Button onClick={() => { setIsCalcModalOpen(false); form.resetFields(); }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
