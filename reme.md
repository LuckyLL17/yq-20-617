# 案件全生命周期管理平台 - 功能扩展与代码优化建议

---

## 🔌 可扩展功能模块（从0-1开发）

### 1. 案件模板管理模块
**功能描述**：用户可以创建、编辑、保存常用的案件模板，快速创建同类案件。
- 模板分类管理（民事、刑事、商事等）
- 模板字段自定义（预设常用字段）
- 模板版本控制
- 模板导入导出
- 快速模板搜索与收藏

**交互方式**：
- 左侧模板分类树，右侧模板列表
- 拖拽方式调整模板字段顺序
- 实时预览模板创建后的效果
- 一键应用模板创建新案件

### 2. 工作日历与提醒模块
**功能描述**：基于案件的重要日期（开庭、截止日期等）生成日历视图和智能提醒。
- 月/周/日三种视图切换
- 案件关键日期自动同步到日历
- 多级提醒设置（提前1天、3天、7天）
- 日历拖拽调整日期
- 个人日程与案件日程叠加显示
- 忙碌时间段标记（避免排期冲突）

**交互方式**：
- 日历点击快速创建日程
- 事件拖拽调整时间
- 弹窗显示当日待办事项
- 桌面通知/浏览器通知提醒

### 3. 法律文书智能生成模块
**功能描述**：基于案件信息自动填充生成常用法律文书模板。
- 文书模板库（起诉状、答辩状、代理词等）
- 变量占位符自动替换
- 文书在线编辑预览
- 版本历史记录
- 一键导出 PDF/Word

**交互方式**：
- 左侧模板列表，右侧编辑区域
- 变量高亮显示，点击快速修改
- 分屏对比预览效果
- 拖拽调整文书段落顺序

### 4. 知识管理与法条库模块
**功能描述**：律所内部知识分享和法条查询系统。
- 法条分类检索（民法典、刑法、诉讼法等）
- 法条收藏与笔记
- 案例库管理（优秀案例分享）
- 知识文章发布与评论
- 关键词全文搜索
- 法条与案件关联

**交互方式**：
- 左侧法条目录树，右侧内容展示
- 高亮标记重要法条
- 悬浮卡片显示法条释义
- 拖拽法条到案件建立关联

### 5. 消息通知与站内信模块
**功能描述**：系统内部消息传递和实时通知中心。
- 案件动态通知（阶段变更、律师分配等）
- 审批流程通知
- 站内信收发
- 消息已读/未读状态
- 通知设置（免打扰、频道选择）
- 消息批量操作

**交互方式**：
- 顶部铃铛图标显示未读数
- 下拉面板展示最新通知
- 消息中心完整列表与筛选
- 站内信对话式界面

### 6. 文档协作与版本控制模块
**功能描述**：案件相关文档的多人协作编辑和版本管理。
- 文档上传与分类存储
- 在线预览（支持多种格式）
- 版本历史回溯
- 文档评论与批注
- 权限控制（查看/编辑/下载）
- 文档操作日志

**交互方式**：
- 文件夹树状结构管理
- 拖拽上传文件
- 分屏显示文档与评论
- 时间线展示版本历史

### 7. 律师工时看板模块
**功能描述**：可视化看板展示律师团队的工时分配与进度。
- 按律师/按案件双维度看板
- 工时卡片拖拽调整
- 颜色标记工作类型
- 周/月工时统计卡片
- 团队成员负载均衡视图
- 超时工作预警

**交互方式**：
- 看板列之间拖拽工时卡片
- 点击卡片展开详情编辑
- 滑块调整预估工时
- 热力图展示工时分布

### 8. 客户门户自助模块
**功能描述**：为客户提供专属门户，可自助查看案件进度和提交材料。
- 案件进度时间线
- 费用账单查看
- 在线上传证据材料
- 消息留言功能
- 电子签收确认
- 满意度评价

**交互方式**：
- 独立的客户登录入口
- 时间线式进度展示
- 拖拽上传材料
- 在线签名确认

---

## 🔄 可迭代功能模块（基于已有功能优化）

### 1. 案件列表高级筛选与数据透视
**基于现有功能**：案件列表查询
**新增功能**：
- 多条件组合筛选（保存筛选方案）
- 数据透视表视图（按类型/状态/律师分组）
- 自定义列显示与排序
- 列表批量操作（批量分配律师、批量改状态）
- 列表导出 Excel（自定义导出字段）
- 快捷筛选标签栏

**交互方式**：
- 顶部筛选面板展开收起
- 拖拽调整列顺序
- 右键菜单快捷操作
- 筛选条件可视化标签

### 2. 费用结算流程自动化
**基于现有功能**：费用计算与发票管理
**新增功能**：
- 计费规则引擎（可视化配置计费规则）
- 自动对账与差额提醒
- 分期付款计划
- 费用预警（超预算提醒）
- 账单批量生成
- 收款进度追踪看板

**交互方式**：
- 流程图展示计费规则
- 滑块调整费用阈值
- 拖拽配置对账规则
- 进度条展示收款状态

### 3. 绩效分配方案可视化配置
**基于现有功能**：绩效计算算法
**新增功能**：
- 权重因子可视化调整（滑块）
- 分配方案预览与对比
- 历史方案回溯与复制
- 分配结果模拟演算
- 绩效趋势图表分析
- 律师绩效排行榜动画

**交互方式**：
- 雷达图展示各因子权重
- 拖拽调整贡献比例
- 实时刷新预览结果
- 滑动对比不同方案

### 4. 案件详情页布局自定义
**基于现有功能**：案件详情展示
**新增功能**：
- 卡片式布局拖拽调整
- 模块显示隐藏配置
- 多标签页切换视图
- 快速操作浮动工具栏
- 关键信息置顶标记
- 详情页暗黑模式

**交互方式**：
- 进入编辑模式拖拽卡片
- 右键添加/移除模块
- 标签页左右滑动切换
- 浮动按钮展开快捷操作

### 5. 律师档案与能力标签体系
**基于现有功能**：用户管理
**新增功能**：
- 律师专业领域标签
- 执业经验数据可视化
- 胜诉率统计卡片
- 擅长案件类型图谱
- 律师忙闲状态实时显示
- 律师评价与积分体系

**交互方式**：
- 标签云展示专业领域
- 雷达图展示能力模型
- 时间线展示执业经历
- 状态指示灯显示忙闲

### 6. 案件阶段流转审批流程
**基于现有功能**：案件阶段变更
**新增功能**：
- 可视化审批流程设计器
- 多级会签与或签
- 审批时限与超时提醒
- 审批意见模板
- 委托代理审批
- 审批流程进度追踪

**交互方式**：
- 拖拽节点设计流程图
- 点击节点配置审批人
- 时间线展示审批进度
- 快捷选择审批意见模板

### 7. 利益冲突检索智能化
**基于现有功能**：冲突检查记录
**新增功能**：
- 自动检索关联案件
- 关键词智能匹配
- 冲突风险等级评估
- 冲突报告自动生成
- 历史冲突案例参考
- 冲突解除审批流程

**交互方式**：
- 输入关键词实时检索
- 风险等级颜色标识
- 图谱展示关联关系
- 一键生成冲突报告

### 8. 数据看板多维度钻取
**基于现有功能**：绩效报表
**新增功能**：
- 20+ 种图表类型选择
- 图表联动钻取（点击下钻）
- 仪表盘自定义布局
- 数据预警阈值设置
- 报表定时邮件推送
- 多维度数据交叉分析

**交互方式**：
- 拖拽配置仪表盘
- 点击图表元素下钻明细
- 滑块调整预警阈值
- 时间范围快捷选择

---

## 💡 代码理解与优化建议

### 一、代码深度理解

#### 1. 计费算法模块深度解析
**文件位置**：[billingCalculator.ts](file:///Volumes/ExMac/traeProject/全站1/yq-20/yq-20-1/backend/src/utils/billingCalculator.ts)

**核心逻辑理解**：
```typescript
// 五种计费模式的策略模式实现
// - HOURLY: 工时 × 费率（简单线性计算）
// - FIXED: 固定金额（无视工时）
// - CONTINGENCY: 标的额 × 比例（风险代理）
// - PROGRESSIVE: 分段累进计费（类似个税计算）
// - MIXED: 基础费 + 超工时 + 风险分成（组合模式）
```

**设计意图分析**：
- 使用 `breakdown` 数组记录每一步计算明细，便于前端展示费用构成
- `ProgressiveTier` 分段计费支持自定义费率阶梯
- `MixedConfig` 混合模式支持三种计费方式任意组合
- 设计上符合"开放封闭原则"，新增计费模式只需添加 case

**潜在问题**：
- 分段计费逻辑中 `tierRange` 计算可能存在边界问题（当 maxAmount 为 Infinity 时）
- 混合模式缺少参数校验（如 baseFee 为负数）
- 缺少计费规则的持久化配置能力

---

#### 2. 绩效分配算法深度解析
**文件位置**：[performanceCalculator.ts](file:///Volumes/ExMac/traeProject/全站1/yq-20/yq-20-1/backend/src/utils/performanceCalculator.ts)

**核心逻辑理解**：
```typescript
// 贡献度计算三维模型：
// 1. 时间权重：实际工作小时数
// 2. 任务权重：TASK_WEIGHTS（出庭×2.0, 文书×1.5...）
// 3. 角色权重：ROLE_WEIGHTS（主办×2.0, 协办×1.2...）
//
// 公式：贡献度 = Σ(工时 × 任务权重) × 角色权重
//       分配比例 = 个人贡献度 / 总贡献度
```

**设计意图分析**：
- 使用 `Map` 数据结构聚合律师工时，时间复杂度 O(n)
- 先计算任务加权工时，再乘以角色权重，符合"先个体后团队"的分配逻辑
- `totalWeightedHours === 0` 时设为 1，避免除零错误
- 结果按分配比例降序排列，便于展示排名

**潜在问题**：
- 角色权重应用方式可能有问题：是乘法而非加权平均
- `TASK_WEIGHTS` 和 `ROLE_WEIGHTS` 硬编码，无法动态配置
- 缺少律师手动调整分配比例的能力

---

### 二、代码重构建议

#### 1. 计费与绩效算法模块重构（策略模式 + 工厂模式）

**当前问题**：
- `calculateBillingFee` 函数使用 switch case，违反开闭原则
- 缺少统一的计费策略接口
- 无法动态注册新计费模式

**重构方案**：

```typescript
// 1. 定义策略接口
interface BillingStrategy {
  calculate(config: BillingConfig, context: BillingContext): BillingResult;
  validate(config: BillingConfig): ValidationResult;
}

// 2. 策略工厂
class BillingStrategyFactory {
  private strategies: Map<BillingMode, BillingStrategy> = new Map();
  
  register(mode: BillingMode, strategy: BillingStrategy) {
    this.strategies.set(mode, strategy);
  }
  
  getStrategy(mode: BillingMode): BillingStrategy {
    const strategy = this.strategies.get(mode);
    if (!strategy) throw new Error(`Unsupported billing mode: ${mode}`);
    return strategy;
  }
}

// 3. 各模式独立实现
class HourlyBillingStrategy implements BillingStrategy { /* ... */ }
class FixedBillingStrategy implements BillingStrategy { /* ... */ }
class ContingencyBillingStrategy implements BillingStrategy { /* ... */ }

// 4. 使用
const factory = new BillingStrategyFactory();
factory.register(BillingMode.HOURLY, new HourlyBillingStrategy());
const result = factory.getStrategy(config.mode).calculate(config, context);
```

**重构收益**：
- 新增计费模式无需修改原有代码
- 每个策略可独立单元测试
- 支持运行时动态注册策略
- 代码职责更清晰

---

#### 2. API 路由层重构（装饰器 + DTO 验证）

**当前问题**：
- [cases.ts](file:///Volumes/ExMac/traeProject/全站1/yq-20/yq-20-1/backend/src/routes/cases.ts) 中手动校验参数，重复代码多
- 缺少统一的请求/响应格式
- 错误处理不一致

**重构方案**：

```typescript
// 1. 使用 class-validator + class-transformer 定义 DTO
class CreateCaseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsEnum(CaseType)
  caseType: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  claimAmount?: number;
}

// 2. 自定义装饰器简化路由
@Controller('/cases')
class CaseController {
  @Post()
  @UseGuards(AuthGuard)
  @ValidateDto(CreateCaseDto)
  async createCase(@Body() dto: CreateCaseDto, @CurrentUser() user: User) {
    return this.caseService.create(dto, user.id);
  }
}

// 3. 统一响应格式
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: number;
}

// 4. 全局异常过滤器
class GlobalExceptionFilter {
  catch(error: Error, req, res) {
    const status = error instanceof HttpException ? error.status : 500;
    res.status(status).json({
      success: false,
      error: error.message,
      timestamp: Date.now()
    });
  }
}
```

**重构收益**：
- 减少 60% 以上的参数校验代码
- 统一的错误处理和响应格式
- TypeScript 类型安全贯穿全链路
- 更符合 Nest.js 等企业级框架规范

---

### 三、代码测试建议

#### 1. 单元测试方案（Jest + TypeScript）

**测试范围**：
- `billingCalculator.ts` - 5种计费模式边界测试
- `performanceCalculator.ts` - 绩效分配算法测试
- 工具函数的各种边界情况

**测试用例设计**：

```typescript
// billingCalculator.test.ts
describe('BillingCalculator', () => {
  describe('HOURLY mode', () => {
    it('should calculate correctly with billable hours', () => {
      const config = { mode: BillingMode.HOURLY, hourlyRate: 500 };
      const timeEntries = [
        { hours: new Prisma.Decimal(8), isBillable: true },
        { hours: new Prisma.Decimal(2), isBillable: false }
      ];
      const result = calculateBillingFee(config, timeEntries);
      expect(result.totalLegalFee).toBe(4000);
    });

    it('should handle zero billable hours', () => { /* ... */ });
    it('should handle negative hourly rate', () => { /* ... */ });
  });

  describe('PROGRESSIVE mode', () => {
    it('should calculate across multiple tiers', () => { /* ... */ });
    it('should handle amount exactly at tier boundary', () => { /* ... */ });
    it('should handle empty tiers array', () => { /* ... */ });
  });

  describe('MIXED mode', () => {
    it('should calculate base fee only when hours under limit', () => { /* ... */ });
    it('should add overtime fee when hours exceed limit', () => { /* ... */ });
    it('should add contingency fee if configured', () => { /* ... */ });
  });
});

// performanceCalculator.test.ts
describe('PerformanceCalculator', () => {
  it('should distribute based on weighted contribution', () => {
    const timeEntries = [
      { lawyerId: 'A', hours: 10, taskType: '出庭' },    // 10 * 2.0 = 20
      { lawyerId: 'B', hours: 20, taskType: '文书撰写' } // 20 * 1.5 = 30
    ];
    // 总贡献度: 50, A占40%, B占60%
  });

  it('should apply role weights correctly', () => { /* ... */ });
  it('should handle zero total hours gracefully', () => { /* ... */ });
  it('should sort results by share ratio descending', () => { /* ... */ });
});
```

**测试覆盖率目标**：
- 核心算法：100% 语句覆盖
- 工具函数：90% 以上分支覆盖
- 边界情况：每个参数至少3个边界值测试

---

#### 2. 集成测试方案（Supertest + Testcontainers）

**测试范围**：
- API 端到端测试
- 数据库 CRUD 操作
- 认证授权流程

**测试架构**：

```typescript
// 1. 测试数据库配置
import { PrismaClient } from '@prisma/client';
import { GenericContainer, PostgreSqlContainer } from 'testcontainers';

beforeAll(async () => {
  const container = await new PostgreSqlContainer()
    .withDatabase('test_db')
    .start();
  
  process.env.DATABASE_URL = container.getConnectionUri();
  global.testDb = new PrismaClient();
  await global.testDb.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
});

// 2. API 测试
import request from 'supertest';
import app from '../src/index';

describe('Cases API', () => {
  let authToken: string;

  beforeAll(async () => {
    // 登录获取 token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: '123456' });
    authToken = res.body.token;
  });

  it('POST /api/cases should create new case', async () => {
    const res = await request(app)
      .post('/api/cases')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: '测试案件',
        clientId: 'client-001',
        caseType: '民事诉讼-合同纠纷',
        billingMode: 'HOURLY'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.caseNumber).toMatch(/^CASE-\d{4}-\d{4}$/);
  });

  it('GET /api/cases should return filtered list', async () => { /* ... */ });
  it('PUT /api/cases/:id should update case', async () => { /* ... */ });
  it('DELETE /api/cases/:id should require admin role', async () => { /* ... */ });
});
```

---

### 四、代码工程化建议

#### 1. 代码质量保障体系

**ESLint + Prettier 配置升级**：

```json
// .eslintrc.json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/strict-boolean-expressions": "warn"
  }
}
```

**Git Hooks + Husky**：

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
npx tsc --noEmit
npm test -- --passWithNoTests
```

**Commitlint 规范**：

```text
# commit 格式规范
type(scope): subject

# type 可选值：
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建/工具链
```

---

#### 2. 项目架构演进方案

**当前架构问题**：
- 缺乏明确的分层架构（routes 直接调用 prisma）
- 业务逻辑与数据访问耦合
- 缺少服务层抽象

**目标架构（分层架构）**：

```
src/
├── controllers/      # 路由层：处理 HTTP 请求/响应
│   ├── CaseController.ts
│   └── BillingController.ts
├── services/         # 服务层：核心业务逻辑
│   ├── CaseService.ts
│   ├── BillingService.ts
│   └── PerformanceService.ts
├── repositories/     # 数据访问层：数据库操作
│   ├── CaseRepository.ts
│   └── UserRepository.ts
├── dto/              # 数据传输对象
│   ├── CreateCaseDto.ts
│   └── CalculateFeeDto.ts
├── entities/         # 领域实体
│   ├── LegalCase.ts
│   └── Invoice.ts
└── common/           # 公共模块
    ├── exceptions/
    ├── guards/
    └── validators/
```

**依赖注入容器**：

```typescript
// 使用 tsyringe 实现 DI
import { container, injectable, inject } from 'tsyringe';

@injectable()
class CaseService {
  constructor(
    @inject('CaseRepository') private caseRepo: CaseRepository,
    @inject('BillingService') private billingService: BillingService
  ) {}
}

// 注册依赖
container.register('CaseRepository', { useClass: PrismaCaseRepository });

// 解析依赖
const caseService = container.resolve(CaseService);
```

---

#### 3. 前端工程化升级

**状态管理方案（Zustand + Immer）**：

```typescript
// stores/caseStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface CaseState {
  cases: LegalCase[];
  currentCase: LegalCase | null;
  filters: CaseFilters;
  loading: boolean;
  fetchCases: () => Promise<void>;
  setCurrentCase: (id: string) => void;
  updateFilters: (filters: Partial<CaseFilters>) => void;
}

export const useCaseStore = create<CaseState>()(
  immer((set, get) => ({
    cases: [],
    currentCase: null,
    loading: false,
    fetchCases: async () => {
      set({ loading: true });
      const res = await api.get('/cases', { params: get().filters });
      set({ cases: res.data, loading: false });
    },
    // ...
  }))
);
```

**组件抽象与复用**：

```typescript
// components/DataTable/index.tsx - 通用表格组件
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  rowKey: keyof T;
}

// hooks/useDebounce.ts - 防抖 Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
```

---

## 📊 实施优先级矩阵

| 建议 | 价值 | 成本 | 优先级 |
|------|------|------|--------|
| 单元测试覆盖核心算法 | ⭐⭐⭐⭐⭐ | ⭐⭐ | P0 |
| ESLint + Prettier 配置 | ⭐⭐⭐⭐ | ⭐ | P0 |
| API 路由层 DTO 验证 | ⭐⭐⭐⭐ | ⭐⭐⭐ | P1 |
| 计费算法策略模式重构 | ⭐⭐⭐⭐ | ⭐⭐⭐ | P1 |
| Husky + Commitlint | ⭐⭐⭐ | ⭐ | P1 |
| 前端 Zustand 状态管理 | ⭐⭐⭐ | ⭐⭐⭐ | P2 |
| 后端分层架构重构 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | P2 |
| 依赖注入容器 | ⭐⭐⭐ | ⭐⭐⭐⭐ | P3 |
| Testcontainers 集成测试 | ⭐⭐⭐ | ⭐⭐⭐⭐ | P3 |

---

> 文档版本: v1.0 | 更新日期: 2026-06-03
