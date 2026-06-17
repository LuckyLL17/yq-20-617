import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Tag,
  Timeline,
  Space,
  Row,
  Col
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const stageLabels: Record<string, string> = {
  CONSULTATION: '案件咨询',
  CONFLICT_CHECK: '利益冲突检索',
  CASE_REGISTRATION: '案件登记',
  APPROVAL: '案件审批',
  LAWYER_ASSIGNMENT: '律师分配',
  EVIDENCE_COLLECTION: '证据收集',
  DRAFT_DOCUMENTS: '文书撰写',
  COURT_FILING: '法院立案',
  EVIDENCE_EXCHANGE: '证据交换',
  PRE_TRIAL_CONFERENCE: '庭前会议',
  COURT_HEARING: '开庭审理',
  JUDGMENT: '判决',
  APPEAL: '上诉',
  ENFORCEMENT: '执行',
  SETTLEMENT: '和解/调解',
  ARCHIVE: '结案归档'
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

const billingLabels: Record<string, string> = {
  HOURLY: '计时收费',
  FIXED: '固定收费',
  CONTINGENCY: '风险代理',
  PROGRESSIVE: '分段累进',
  MIXED: '混合模式'
};

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseItem, setCaseItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [isLawyerModalOpen, setIsLawyerModalOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isStageModalOpen, setIsStageModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { hasRole, user } = useAuth();
  const isClient = user?.role === 'CLIENT';

  useEffect(() => {
    loadCase();
    loadLawyers();
  }, [id]);

  const loadCase = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/cases/${id}`);
      setCaseItem(response.data);
    } catch (error) {
      message.error('加载案件详情失败');
    } finally {
      setLoading(false);
    }
  };

  const loadLawyers = async () => {
    const response = await api.get('/users/lawyers');
    setLawyers(response.data);
  };

  const handleAssignLawyer = async (values: any) => {
    try {
      await api.post(`/cases/${id}/lawyers`, {
        ...values,
        allocation: values.allocation || 100
      });
      message.success('律师分配成功');
      setIsLawyerModalOpen(false);
      form.resetFields();
      loadCase();
    } catch (error) {
      message.error('分配失败');
    }
  };

  const handleAddTimeEntry = async (values: any) => {
    try {
      await api.post(`/cases/${id}/time-entries`, {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        lawyerId: values.lawyerId || user?.id
      });
      message.success('工时记录添加成功');
      setIsTimeModalOpen(false);
      form.resetFields();
      loadCase();
    } catch (error) {
      message.error('添加失败');
    }
  };

  const handleChangeStage = async (values: any) => {
    try {
      await api.post(`/cases/${id}/stage`, values);
      message.success('阶段更新成功');
      setIsStageModalOpen(false);
      form.resetFields();
      loadCase();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleAddEvidence = async (values: any) => {
    try {
      await api.post(`/cases/${id}/evidence`, values);
      message.success('证据添加成功');
      setIsEvidenceModalOpen(false);
      form.resetFields();
      loadCase();
    } catch (error) {
      message.error('添加失败');
    }
  };

  const handleAddHearing = async (values: any) => {
    try {
      await api.post(`/cases/${id}/hearings`, {
        ...values,
        date: values.date.toISOString()
      });
      message.success('排期添加成功');
      setIsHearingModalOpen(false);
      form.resetFields();
      loadCase();
    } catch (error) {
      message.error('添加失败');
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  if (!caseItem) {
    return <div>案件不存在</div>;
  }

  const lawyerColumns = [
    { title: '律师姓名', dataIndex: ['lawyer', 'name'], key: 'name' },
    { title: '角色', dataIndex: 'role', key: 'role' },
    { title: '分配比例', dataIndex: 'allocation', key: 'allocation', render: (v: any) => `${v}%` },
    { title: '主办律师', dataIndex: 'isLead', key: 'isLead', render: (v: boolean) => v ? '是' : '否' },
    { title: '分配时间', dataIndex: 'assignedAt', key: 'assignedAt', render: (v: string) => new Date(v).toLocaleDateString() }
  ];

  const timeColumns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '律师', dataIndex: ['lawyer', 'name'], key: 'lawyer' },
    { title: '工时(小时)', dataIndex: 'hours', key: 'hours', render: (v: any) => typeof v === 'object' ? v.toNumber?.() ?? v : v },
    { title: '工作内容', dataIndex: 'description', key: 'description' },
    { title: '工作类型', dataIndex: 'taskType', key: 'taskType' },
    { title: '费率', dataIndex: 'rate', key: 'rate', render: (v: any) => `¥${typeof v === 'object' ? v.toNumber?.() ?? v : v}/小时` },
    { title: '可计费', dataIndex: 'isBillable', key: 'isBillable', render: (v: boolean) => v ? '是' : '否' }
  ];

  const evidenceColumns = [
    { title: '证据名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '来源', dataIndex: 'source', key: 'source' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '收到日期', dataIndex: 'receivedDate', key: 'receivedDate', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' }
  ];

  const hearingColumns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '日期', dataIndex: 'date', key: 'date', render: (v: string) => new Date(v).toLocaleString() },
    { title: '法院', dataIndex: 'court', key: 'court' },
    { title: '法庭', dataIndex: 'courtroom', key: 'courtroom' },
    { title: '法官', dataIndex: 'judge', key: 'judge' },
    { title: '结果', dataIndex: 'outcome', key: 'outcome' }
  ];

  const toNum = (v: any) => typeof v === 'object' ? (v?.toNumber?.() ?? 0) : (Number(v) || 0);
  const totalHours = caseItem.timeEntries?.reduce((sum: number, t: any) => sum + toNum(t.hours), 0) || 0;
  const totalBillableAmount = caseItem.timeEntries?.reduce((sum: number, t: any) => sum + (t.isBillable ? toNum(t.hours) * toNum(t.rate) : 0), 0) || 0;

  const clientTabs = ['timeline'];
  const lawyerTabs = ['timeline', 'lawyers', 'time', 'evidence', 'hearings', 'billing', 'performance'];

  const visibleTabs = isClient ? clientTabs : lawyerTabs;

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/cases')}
        style={{ marginBottom: 16 }}
      >
        返回案件列表
      </Button>

      <Card title={`${caseItem.caseNumber} - ${caseItem.title}`} style={{ marginBottom: 16 }}>
        <Row gutter={24}>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="案件编号">{caseItem.caseNumber}</Descriptions.Item>
              <Descriptions.Item label="案件类型">{caseItem.caseType}</Descriptions.Item>
              <Descriptions.Item label="客户">{caseItem.client?.name}</Descriptions.Item>
              <Descriptions.Item label="对方当事人">{caseItem.opposingParty || '-'}</Descriptions.Item>
              <Descriptions.Item label="诉讼标的">{caseItem.claimAmount ? `¥${caseItem.claimAmount}` : '-'}</Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="当前状态">
                <Tag color="blue">{statusLabels[caseItem.status] || caseItem.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="当前阶段">{stageLabels[caseItem.currentStage] || caseItem.currentStage}</Descriptions.Item>
              <Descriptions.Item label="计费模式">{billingLabels[caseItem.billingMode]}</Descriptions.Item>
              <Descriptions.Item label="预估费用">{caseItem.estimatedFee ? `¥${caseItem.estimatedFee}` : '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{new Date(caseItem.createdAt).toLocaleString()}</Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        <div style={{ marginTop: 16 }}>
          <h4>案件描述</h4>
          <p>{caseItem.description || '暂无描述'}</p>
        </div>
      </Card>

      <Card>
        <Tabs defaultActiveKey="timeline">
          {visibleTabs.includes('timeline') && (
            <TabPane tab="案件进度" key="timeline">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3>阶段历史</h3>
                {!isClient && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsStageModalOpen(true)}>
                    更新阶段
                  </Button>
                )}
              </div>
              <Timeline>
                {caseItem.stageHistory?.map((history: any) => (
                  <Timeline.Item key={history.id}>
                    <p><strong>{stageLabels[history.stage] || history.stage}</strong></p>
                    <p>开始: {new Date(history.startedAt).toLocaleString()}</p>
                    {history.endedAt && <p>结束: {new Date(history.endedAt).toLocaleString()}</p>}
                    {history.notes && <p>备注: {history.notes}</p>}
                  </Timeline.Item>
                ))}
              </Timeline>
            </TabPane>
          )}

          {visibleTabs.includes('lawyers') && (
            <TabPane tab="律师团队" key="lawyers">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3>办案律师</h3>
                {hasRole(['ADMIN']) && (
                  <Button type="primary" icon={<UserOutlined />} onClick={() => setIsLawyerModalOpen(true)}>
                    分配律师
                  </Button>
                )}
              </div>
              <Table
                columns={lawyerColumns}
                dataSource={caseItem.lawyerAssignments}
                rowKey="id"
                pagination={false}
              />
            </TabPane>
          )}

          {visibleTabs.includes('time') && (
            <TabPane tab="工时记录" key="time">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3>
                  工时记录
                  <Tag color="blue" style={{ marginLeft: 8 }}>总计: {totalHours}小时</Tag>
                  <Tag color="green">计费金额: ¥{totalBillableAmount}</Tag>
                </h3>
                {!isClient && (
                  <Button type="primary" icon={<ClockCircleOutlined />} onClick={() => setIsTimeModalOpen(true)}>
                    添加工时
                  </Button>
                )}
              </div>
              <Table
                columns={timeColumns}
                dataSource={caseItem.timeEntries}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
          )}

          {visibleTabs.includes('evidence') && (
            <TabPane tab="证据管理" key="evidence">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3>证据清单</h3>
                {!isClient && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsEvidenceModalOpen(true)}>
                    添加证据
                  </Button>
                )}
              </div>
              <Table
                columns={evidenceColumns}
                dataSource={caseItem.evidence}
                rowKey="id"
                pagination={false}
              />
            </TabPane>
          )}

          {visibleTabs.includes('hearings') && (
            <TabPane tab="出庭排期" key="hearings">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3>庭审排期</h3>
                {!isClient && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsHearingModalOpen(true)}>
                    添加排期
                  </Button>
                )}
              </div>
              <Table
                columns={hearingColumns}
                dataSource={caseItem.hearings}
                rowKey="id"
                pagination={false}
              />
            </TabPane>
          )}

          {visibleTabs.includes('billing') && (
            <TabPane tab="费用结算" key="billing">
              <h3>费用明细</h3>
              <p>计费模式: {billingLabels[caseItem.billingMode]}</p>
              <p>预估费用: ¥{caseItem.estimatedFee || 0}</p>
              <p>已记录工时: {totalHours}小时</p>
              <p>计时费用: ¥{totalBillableAmount}</p>
              <h4 style={{ marginTop: 16 }}>代垫费用</h4>
              <Table
                columns={[
                  { title: '描述', dataIndex: 'description', key: 'description' },
                  { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: any) => `¥${toNum(v)}` },
                  { title: '是否报销', dataIndex: 'reimbursed', key: 'reimbursed', render: (v: boolean) => v ? '是' : '否' },
                  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => new Date(v).toLocaleDateString() }
                ]}
                dataSource={caseItem.advanceFees}
                rowKey="id"
                pagination={false}
              />
            </TabPane>
          )}

          {visibleTabs.includes('performance') && (
            <TabPane tab="绩效分配" key="performance">
              <h3>绩效分配</h3>
              <Table
                columns={[
                  { title: '律师', dataIndex: ['lawyer', 'name'], key: 'lawyer' },
                  { title: '总工时', dataIndex: 'totalHours', key: 'totalHours', render: (v: any) => `${toNum(v)}小时` },
                  { title: '工时占比', dataIndex: 'timeShare', key: 'timeShare', render: (v: any) => `${(toNum(v) * 100).toFixed(1)}%` },
                  { title: '贡献度', dataIndex: 'contribution', key: 'contribution', render: (v: any) => `${(toNum(v) * 100).toFixed(1)}%` },
                  { title: '分配比例', dataIndex: 'shareRatio', key: 'shareRatio', render: (v: any) => `${(toNum(v) * 100).toFixed(1)}%` },
                  { title: '分配金额', dataIndex: 'allocatedFee', key: 'allocatedFee', render: (v: any) => `¥${toNum(v)}` }
                ]}
                dataSource={caseItem.performanceShares}
                rowKey="id"
                pagination={false}
              />
            </TabPane>
          )}
        </Tabs>
      </Card>

      <Modal title="分配律师" open={isLawyerModalOpen} onCancel={() => { setIsLawyerModalOpen(false); form.resetFields(); }} footer={null} destroyOnClose>
        <Form form={form} onFinish={handleAssignLawyer}>
          <Form.Item name="lawyerId" label="选择律师" rules={[{ required: true }]}>
            <Select>
              {lawyers.map(lawyer => (
                <Option key={lawyer.id} value={lawyer.id}>
                  {lawyer.name} ({lawyer.department || '-'})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]}>
            <Select>
              <Option value="主办律师">主办律师</Option>
              <Option value="协办律师">协办律师</Option>
              <Option value="律师助理">律师助理</Option>
            </Select>
          </Form.Item>
          <Form.Item name="allocation" label="分配比例(%)" initialValue={100}>
            <InputNumber min={0} max={100} />
          </Form.Item>
          <Form.Item name="isLead" label="是否主办律师">
            <Select>
              <Option value={true as any}>是</Option>
              <Option value={false as any}>否</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确认分配</Button>
              <Button onClick={() => { setIsLawyerModalOpen(false); form.resetFields(); }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="添加工时记录" open={isTimeModalOpen} onCancel={() => { setIsTimeModalOpen(false); form.resetFields(); }} footer={null} destroyOnClose>
        <Form form={form} onFinish={handleAddTimeEntry}>
          <Form.Item name="lawyerId" label="律师">
            <Select>
              <Option value={user?.id}>我自己</Option>
              {caseItem.lawyerAssignments?.map((a: any) => (
                <Option key={a.lawyerId} value={a.lawyerId}>{a.lawyer.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="hours" label="工时(小时)" rules={[{ required: true }]}>
            <InputNumber min={0.5} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="工作内容" rules={[{ required: true }]}>
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="taskType" label="工作类型">
            <Select>
              <Option value="法律研究">法律研究</Option>
              <Option value="文书撰写">文书撰写</Option>
              <Option value="客户沟通">客户沟通</Option>
              <Option value="出庭">出庭</Option>
              <Option value="证据整理">证据整理</Option>
              <Option value="行政事务">行政事务</Option>
            </Select>
          </Form.Item>
          <Form.Item name="rate" label="费率(元/小时)" initialValue={500}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isBillable" label="可计费">
            <Select>
              <Option value={true as any}>是</Option>
              <Option value={false as any}>否</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确认添加</Button>
              <Button onClick={() => { setIsTimeModalOpen(false); form.resetFields(); }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="更新案件阶段" open={isStageModalOpen} onCancel={() => { setIsStageModalOpen(false); form.resetFields(); }} footer={null} destroyOnClose>
        <Form form={form} onFinish={handleChangeStage}>
          <Form.Item name="stage" label="新阶段" rules={[{ required: true }]}>
            <Select>
              {Object.entries(stageLabels).map(([value, label]) => (
                <Option key={value} value={value}>{label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确认更新</Button>
              <Button onClick={() => { setIsStageModalOpen(false); form.resetFields(); }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="添加证据" open={isEvidenceModalOpen} onCancel={() => { setIsEvidenceModalOpen(false); form.resetFields(); }} footer={null} destroyOnClose>
        <Form form={form} onFinish={handleAddEvidence}>
          <Form.Item name="name" label="证据名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="证据类型" rules={[{ required: true }]}>
            <Select>
              <Option value="书证">书证</Option>
              <Option value="物证">物证</Option>
              <Option value="视听资料">视听资料</Option>
              <Option value="证人证言">证人证言</Option>
              <Option value="电子数据">电子数据</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item name="source" label="来源">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="已接收">
            <Select>
              <Option value="已接收">已接收</Option>
              <Option value="待提交">待提交</Option>
              <Option value="已提交">已提交</Option>
              <Option value="已归档">已归档</Option>
            </Select>
          </Form.Item>
          <Form.Item name="storedLocation" label="存放位置">
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确认添加</Button>
              <Button onClick={() => { setIsEvidenceModalOpen(false); form.resetFields(); }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="添加出庭排期" open={isHearingModalOpen} onCancel={() => { setIsHearingModalOpen(false); form.resetFields(); }} footer={null} destroyOnClose>
        <Form form={form} onFinish={handleAddHearing}>
          <Form.Item name="title" label="排期标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="date" label="日期时间" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="court" label="法院">
            <Input />
          </Form.Item>
          <Form.Item name="courtroom" label="法庭">
            <Input />
          </Form.Item>
          <Form.Item name="judge" label="法官">
            <Input />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确认添加</Button>
              <Button onClick={() => { setIsHearingModalOpen(false); form.resetFields(); }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
