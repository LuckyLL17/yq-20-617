import { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, Steps, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Option } = Select;
const { TextArea } = Input;

const billingModes = [
  { value: 'HOURLY', label: '计时收费' },
  { value: 'FIXED', label: '固定收费' },
  { value: 'CONTINGENCY', label: '风险代理' },
  { value: 'PROGRESSIVE', label: '分段累进' },
  { value: 'MIXED', label: '混合模式' }
];

const caseTypes = [
  '民事诉讼-合同纠纷',
  '民事诉讼-侵权纠纷',
  '民事诉讼-婚姻家庭',
  '刑事诉讼',
  '行政诉讼',
  '公司法务',
  '知识产权',
  '劳动争议',
  '其他'
];

const step1Fields = ['title', 'clientId', 'caseType'];
const step2Fields = ['opposingParty', 'claimAmount', 'court'];
const step3Fields = ['billingMode', 'estimatedFee', 'contingencyRate'];

export default function CaseCreate() {
  const [currentStep, setCurrentStep] = useState(0);
  const [clients, setClients] = useState<any[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const response = await api.get('/clients');
    setClients(response.data);
  };

  const validateCurrentStep = async () => {
    const fieldsMap = [step1Fields, step2Fields, step3Fields];
    const requiredFields = fieldsMap[currentStep].filter(f => {
      const rules = [
        ['title', 'clientId', 'caseType'],
        [],
        ['billingMode']
      ];
      return rules[currentStep].includes(f);
    });
    try {
      await form.validateFields(requiredFields);
      return true;
    } catch {
      return false;
    }
  };

  const handleNext = async () => {
    const valid = await validateCurrentStep();
    if (valid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields(step1Fields.concat(step3Fields));
      const allValues = form.getFieldsValue(true);
      const payload: any = {};
      if (allValues.title) payload.title = allValues.title;
      if (allValues.clientId) payload.clientId = allValues.clientId;
      if (allValues.caseType) payload.caseType = allValues.caseType;
      if (allValues.billingMode) payload.billingMode = allValues.billingMode;
      if (allValues.description) payload.description = allValues.description;
      if (allValues.opposingParty) payload.opposingParty = allValues.opposingParty;
      if (allValues.claimAmount) payload.claimAmount = Number(allValues.claimAmount);
      if (allValues.court) payload.court = allValues.court;
      if (allValues.estimatedFee) payload.estimatedFee = Number(allValues.estimatedFee);
      if (allValues.contingencyRate) payload.contingencyRate = Number(allValues.contingencyRate);
      await api.post('/cases', payload);
      message.success('案件创建成功');
      navigate('/cases');
    } catch (error: any) {
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else if (error.errorFields) {
        message.error('请填写必填字段');
      }
    }
  };

  const steps = [
    {
      title: '基本信息',
      content: (
        <>
          <Form.Item
            name="title"
            label="案件名称"
            rules={[{ required: true, message: '请输入案件名称' }]}
          >
            <Input placeholder="请输入案件名称" />
          </Form.Item>
          <Form.Item
            name="clientId"
            label="客户"
            rules={[{ required: true, message: '请选择客户' }]}
          >
            <Select placeholder="请选择客户">
              {clients.map(client => (
                <Option key={client.id} value={client.id}>{client.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="caseType"
            label="案件类型"
            rules={[{ required: true, message: '请选择案件类型' }]}
          >
            <Select placeholder="请选择案件类型">
              {caseTypes.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="案件描述">
            <TextArea rows={4} placeholder="请描述案件情况" />
          </Form.Item>
        </>
      )
    },
    {
      title: '对方信息',
      content: (
        <>
          <Form.Item name="opposingParty" label="对方当事人">
            <Input placeholder="请输入对方当事人名称" />
          </Form.Item>
          <Form.Item name="claimAmount" label="诉讼标的金额">
            <Input type="number" placeholder="请输入诉讼标的金额" />
          </Form.Item>
          <Form.Item name="court" label="受理法院">
            <Input placeholder="请输入受理法院" />
          </Form.Item>
        </>
      )
    },
    {
      title: '计费方式',
      content: (
        <>
          <Form.Item
            name="billingMode"
            label="计费模式"
            rules={[{ required: true, message: '请选择计费模式' }]}
          >
            <Select placeholder="请选择计费模式">
              {billingModes.map(mode => (
                <Option key={mode.value} value={mode.value}>{mode.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="estimatedFee" label="预估费用">
            <Input type="number" placeholder="请输入预估费用" />
          </Form.Item>
          <Form.Item name="contingencyRate" label="风险代理费率(%)">
            <Input type="number" placeholder="适用于风险代理模式" />
          </Form.Item>
        </>
      )
    }
  ];

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/cases')}
        style={{ marginBottom: 16 }}
      >
        返回案件列表
      </Button>
      <Card title="新建案件">
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map(step => (
            <Steps.Step key={step.title} title={step.title} />
          ))}
        </Steps>
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 600, margin: '0 auto' }}
          preserve
        >
          {steps.map((step, index) => (
            <div key={step.title} style={{ display: index === currentStep ? 'block' : 'none' }}>
              {step.content}
            </div>
          ))}
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              上一步
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button type="primary" onClick={handleNext}>
                下一步
              </Button>
            ) : (
              <Button type="primary" onClick={handleSubmit}>
                创建案件
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
}
