import { PrismaClient, UserRole, BillingMode, CaseStatus, CaseStage } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      name: '系统管理员',
      email: 'admin@lawfirm.com',
      role: UserRole.ADMIN,
      phone: '13800138000',
      department: '行政部'
    }
  });

  const finance = await prisma.user.upsert({
    where: { username: 'finance' },
    update: {},
    create: {
      username: 'finance',
      passwordHash,
      name: '财务主管',
      email: 'finance@lawfirm.com',
      role: UserRole.FINANCE,
      phone: '13800138001',
      department: '财务部'
    }
  });

  const lawyer1 = await prisma.user.upsert({
    where: { username: 'lawyer1' },
    update: {},
    create: {
      username: 'lawyer1',
      passwordHash,
      name: '张明律师',
      email: 'zhangming@lawfirm.com',
      role: UserRole.LAWYER,
      phone: '13900139001',
      department: '民事诉讼部',
      hourlyRate: 500
    }
  });

  const lawyer2 = await prisma.user.upsert({
    where: { username: 'lawyer2' },
    update: {},
    create: {
      username: 'lawyer2',
      passwordHash,
      name: '李华律师',
      email: 'lihua@lawfirm.com',
      role: UserRole.LAWYER,
      phone: '13900139002',
      department: '公司法务部',
      hourlyRate: 800
    }
  });

  await prisma.user.upsert({
    where: { username: 'client1' },
    update: {},
    create: {
      username: 'client1',
      passwordHash,
      name: '客户王总',
      email: 'client@example.com',
      role: UserRole.CLIENT,
      phone: '13700137000'
    }
  });

  const client = await prisma.client.upsert({
    where: { id: 'client-demo-1' },
    update: {},
    create: {
      id: 'client-demo-1',
      name: 'ABC科技有限公司',
      type: '企业客户',
      idNumber: '91110000MA001ABCDE',
      phone: '010-12345678',
      email: 'contact@abctech.com',
      address: '北京市朝阳区科技园区88号',
      contactPerson: '王总'
    }
  });

  const demoCase = await prisma.legalCase.upsert({
    where: { caseNumber: 'CASE-2024-0001' },
    update: {},
    create: {
      caseNumber: 'CASE-2024-0001',
      title: 'ABC科技与XYZ公司合同纠纷案',
      description: 'ABC科技有限公司与XYZ公司因软件开发合同产生纠纷，涉及金额500万元',
      caseType: '民事诉讼-合同纠纷',
      status: CaseStatus.ACTIVE,
      currentStage: CaseStage.EVIDENCE_COLLECTION,
      priority: '高',
      court: '北京市第一中级人民法院',
      caseNo: '(2024)京01民初123号',
      opposingParty: 'XYZ科技有限公司',
      claimAmount: 5000000,
      clientId: client.id,
      createdById: lawyer1.id,
      billingMode: BillingMode.PROGRESSIVE,
      estimatedFee: 150000,
      stageHistory: {
        create: [
          {
            stage: CaseStage.CONSULTATION,
            startedAt: new Date('2024-01-15'),
            endedAt: new Date('2024-01-18'),
            notes: '初次咨询，了解案件情况',
            operatorId: lawyer1.id
          },
          {
            stage: CaseStage.CONFLICT_CHECK,
            startedAt: new Date('2024-01-18'),
            endedAt: new Date('2024-01-20'),
            notes: '完成利益冲突检索，无冲突',
            operatorId: admin.id
          },
          {
            stage: CaseStage.CASE_REGISTRATION,
            startedAt: new Date('2024-01-20'),
            endedAt: new Date('2024-01-22'),
            notes: '完成案件登记和审批',
            operatorId: admin.id
          },
          {
            stage: CaseStage.LAWYER_ASSIGNMENT,
            startedAt: new Date('2024-01-22'),
            endedAt: new Date('2024-01-25'),
            notes: '已分配主办律师和协办律师',
            operatorId: admin.id
          },
          {
            stage: CaseStage.EVIDENCE_COLLECTION,
            startedAt: new Date('2024-01-25'),
            notes: '正在收集证据',
            operatorId: lawyer1.id
          }
        ]
      }
    }
  });

  await prisma.lawyerAssignment.upsert({
    where: { id: 'assign-1' },
    update: {},
    create: {
      id: 'assign-1',
      caseId: demoCase.id,
      lawyerId: lawyer2.id,
      role: '主办律师',
      allocation: 60,
      isLead: true
    }
  });

  await prisma.lawyerAssignment.upsert({
    where: { id: 'assign-2' },
    update: {},
    create: {
      id: 'assign-2',
      caseId: demoCase.id,
      lawyerId: lawyer1.id,
      role: '协办律师',
      allocation: 40,
      isLead: false
    }
  });

  await prisma.timeEntry.upsert({
    where: { id: 'time-1' },
    update: {},
    create: {
      id: 'time-1',
      caseId: demoCase.id,
      lawyerId: lawyer2.id,
      date: new Date('2024-01-26'),
      hours: 3,
      description: '案件分析与策略制定',
      taskType: '法律研究',
      rate: 800,
      isBillable: true
    }
  });

  await prisma.timeEntry.upsert({
    where: { id: 'time-2' },
    update: {},
    create: {
      id: 'time-2',
      caseId: demoCase.id,
      lawyerId: lawyer1.id,
      date: new Date('2024-01-26'),
      hours: 2,
      description: '证据材料整理',
      taskType: '证据整理',
      rate: 500,
      isBillable: true
    }
  });

  await prisma.evidence.upsert({
    where: { id: 'evd-1' },
    update: {},
    create: {
      id: 'evd-1',
      caseId: demoCase.id,
      name: '软件开发合同原件',
      type: '书证',
      description: '双方签署的软件开发合同',
      source: '客户提供',
      receivedDate: new Date('2024-01-25'),
      status: '已接收',
      storedLocation: '档案柜A-03'
    }
  });

  await prisma.hearing.upsert({
    where: { id: 'hearing-1' },
    update: {},
    create: {
      id: 'hearing-1',
      caseId: demoCase.id,
      title: '第一次证据交换',
      date: new Date('2024-03-15T09:30:00'),
      court: '北京市第一中级人民法院',
      courtroom: '第三法庭',
      judge: '王法官'
    }
  });

  console.log('种子数据创建完成!');
  console.log('默认密码: 123456');
  console.log('测试账号:');
  console.log('  - 管理员: admin');
  console.log('  - 财务: finance');
  console.log('  - 律师1: lawyer1');
  console.log('  - 律师2: lawyer2');
  console.log('  - 客户: client1');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
