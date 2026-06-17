# 案件全生命周期管理平台

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![License](https://img.shields.io/badge/license-MIT-yellow)
![PR](https://img.shields.io/badge/PRs-welcome-brightgreen)

一个功能完整的律所案件管理系统，支持案件从咨询到结案的全流程管理，包括费用结算和绩效分配。

[快速开始](#快速开始) • [功能特性](#功能特性) • [技术栈](#技术栈) • [部署指南](#部署指南) • [常见问题](#常见问题)

</div>

## 功能特性

### 案件全生命周期管理（20+环节）
- 案件咨询 → 利益冲突检索 → 案件登记 → 案件审批
- 律师分配 → 证据收集 → 文书撰写 → 法院立案
- 证据交换 → 庭前会议 → 开庭审理 → 判决
- 上诉 → 执行 → 和解/调解 → 结案归档

### 费用结算系统（多种计费模式混合计算）
- **计时收费**: 按小时费率计算
- **固定收费**: 一次性固定费用
- **风险代理**: 按胜诉金额比例收费
- **分段累进**: 按标的额分段累进计费
- **混合模式**: 基础费+计时+风险分成
- **代垫费用管理**: 支持代垫费用报销
- **发票管理**: 开票、收款、对账

### 绩效分配算法
- **工时分摊**: 基于实际工作时间计算
- **贡献占比**: 考虑角色权重（主办律师/协办律师/助理）
- **任务权重**: 不同工作类型权重不同（出庭、文书、研究等）
- **跨团队分成**: 支持多团队/律师间的费用分配
- **可视化报表**: 柱状图、饼图展示分配结果

### 用户角色
- **管理员**: 系统管理、用户管理、全部权限
- **律师**: 案件办理、工时记录、查看分配
- **财务**: 费用结算、发票管理、绩效计算
- **客户**: 查看案件进度（只读）

## 技术栈

### 后端
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- JWT 认证
- Zod 数据验证

### 前端
- React 18 + TypeScript
- Vite 构建工具
- Ant Design UI 组件库
- React Router 路由
- Recharts 图表库

## 快速开始

### 前置要求
- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- npm >= 9.0.0 或 yarn >= 1.22.0

### 🚀 一键快速启动（推荐）

```bash
# 克隆项目后，在根目录执行
chmod +x quick-start.sh
./quick-start.sh
```

### 手动安装步骤

#### 1. 安装依赖

```bash
# 方式一：一键安装所有依赖（根目录）
npm run install:all

# 方式二：分别安装
npm install          # 根目录依赖
cd backend && npm install
cd ../frontend && npm install
```

#### 2. 配置数据库

1. 创建 PostgreSQL 数据库
   ```sql
   CREATE DATABASE legal_case_management;
   ```

2. 复制并修改环境配置文件：
   ```bash
   cd backend
   cp .env.example .env
   ```

3. 修改 `backend/.env` 中的数据库连接信息：
   ```env
   DATABASE_URL="postgresql://用户名:密码@localhost:5432/legal_case_management?schema=public"
   JWT_SECRET="your-secret-key-here-change-in-production"
   PORT=3001
   ```

#### 3. 初始化数据库

```bash
cd backend

# 一键初始化（生成 Client + 迁移 + 种子数据）
npm run db:setup

# 或分步执行
npm run db:generate    # 生成 Prisma Client
npm run db:migrate     # 执行数据库迁移
npm run db:seed        # 插入测试数据（可选）
```

#### 4. 启动服务

```bash
# 方式一：同时启动前后端（根目录）
npm run dev

# 方式二：一键初始化并启动（根目录）
npm run setup && npm run dev

# 方式三：分别启动
# 后端 (端口 3001)
cd backend && npm run start:dev

# 前端 (端口 3000)
cd frontend && npm run dev
```

#### 5. 访问系统

🌐 **前端地址**: http://localhost:3000  
🔌 **后端 API**: http://localhost:3001/api

### 🧪 测试账号

种子数据创建了以下测试账号（密码均为 `123456`）：

| 用户名 | 角色 | 说明 |
|--------|------|------|
| `admin` | 管理员 | 全部系统权限 |
| `finance` | 财务 | 费用结算、绩效计算 |
| `lawyer1` | 律师 | 案件办理、工时记录（500元/小时） |
| `lawyer2` | 律师 | 高费率律师（800元/小时） |
| `client1` | 客户 | 查看案件进度 |

> 💡 首次登录后请及时修改默认密码

## 项目结构

```
.
├── backend/                 # 后端项目
│   ├── prisma/             # 数据库模型
│   │   └── schema.prisma   # Prisma Schema
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── middleware/     # 中间件
│   │   ├── utils/          # 工具函数（计费、绩效算法）
│   │   ├── seed.ts         # 测试数据
│   │   └── index.ts        # 入口文件
│   └── package.json
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── components/     # 公共组件
│   │   ├── pages/          # 页面组件
│   │   ├── contexts/       # React Context
│   │   ├── services/       # API 服务
│   │   └── main.tsx        # 入口文件
│   └── package.json
└── package.json            # 根 package.json
```

## 核心算法说明

### 费用结算算法 ([billingCalculator.ts](backend/src/utils/billingCalculator.ts))

支持 5 种计费模式：
1. **计时收费**: `费用 = 可计费工时 × 小时费率`
2. **固定收费**: 约定的固定金额
3. **风险代理**: `费用 = 胜诉金额 × 风险比例`
4. **分段累进**: 按标的额分段，每段适用不同费率
5. **混合模式**: `基础费 + 超工时费 + 风险分成`

### 绩效分配算法 ([performanceCalculator.ts](backend/src/utils/performanceCalculator.ts))

计算因子：
- **时间权重**: 实际工作小时数
- **角色权重**: 主办律师×2.0，协办×1.2，助理×0.8
- **任务权重**: 出庭×2.0，文书×1.5，研究×1.0等

分配公式：
```
贡献度 = 工时 × 任务权重 × 角色权重
个人分配比例 = 个人贡献度 ÷ 总贡献度
个人分配金额 = 总费用 × 个人分配比例
```

## API 接口

### 认证
- `POST /api/auth/login` - 用户登录

### 案件
- `GET /api/cases` - 案件列表
- `GET /api/cases/:id` - 案件详情
- `POST /api/cases` - 创建案件
- `POST /api/cases/:id/stage` - 更新案件阶段
- `POST /api/cases/:id/lawyers` - 分配律师
- `POST /api/cases/:id/time-entries` - 添加工时
- `POST /api/cases/:id/evidence` - 添加证据
- `POST /api/cases/:id/hearings` - 添加排期

### 费用结算
- `GET /api/billing/invoices` - 发票列表
- `POST /api/billing/invoices` - 创建发票
- `POST /api/billing/calculate` - 计算费用
- `POST /api/billing/invoices/:id/payments` - 登记付款

### 绩效分配
- `POST /api/performance/calculate/:caseId` - 计算绩效
- `POST /api/performance/save/:caseId` - 保存分配
- `GET /api/performance/reports/ranking` - 律师排名

## 数据库表结构

核心数据表：
- `User` - 用户表
- `Client` - 客户表
- `LegalCase` - 案件表
- `StageHistory` - 阶段历史表
- `LawyerAssignment` - 律师分配表
- `TimeEntry` - 工时记录表
- `Evidence` - 证据表
- `Hearing` - 庭审排期表
- `Invoice` - 发票表
- `InvoiceItem` - 发票明细表
- `Payment` - 付款记录表
- `AdvanceFee` - 代垫费用表
- `PerformanceShare` - 绩效分配表

## 部署指南

### 生产环境部署

#### 1. 构建项目

```bash
# 根目录执行，同时构建前后端
npm run build

# 或分别构建
cd backend && npm run build
cd ../frontend && npm run build
```

#### 2. 使用 PM2 部署后端

```bash
# 安装 PM2
npm install -g pm2

# 启动后端服务
cd backend
pm2 start dist/index.js --name "legal-backend"

# 查看状态
pm2 status
pm2 logs legal-backend
```

#### 3. 前端部署（Nginx）

将 `frontend/dist` 目录部署到 Nginx 静态资源目录，并配置反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态资源
    location / {
        root /path/to/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 反向代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Docker 部署

```bash
# 后端 Dockerfile 示例
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

## 📋 可用脚本

### 根目录脚本

| 命令 | 说明 |
|------|------|
| `npm run install:all` | 安装前后端所有依赖 |
| `npm run db:setup` | 后端数据库初始化 |
| `npm run dev:backend` | 启动后端开发服务 |
| `npm run dev:frontend` | 启动前端开发服务 |
| `npm run dev` | 同时启动前后端开发服务 |
| `npm run setup` | 一键安装依赖并初始化数据库 |
| `npm run build` | 构建前后端生产版本 |

### 后端脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run db:generate` | 生成 Prisma Client |
| `npm run db:migrate` | 执行数据库迁移 |
| `npm run db:seed` | 插入种子数据 |
| `npm run db:reset` | 重置数据库 |
| `npm run db:setup` | 完整数据库初始化 |
| `npm run start:dev` | 生成 Client 后启动开发服务 |

## 🔧 常见问题

### Q1: Prisma Client 报错 "找不到模型"
**A**: 执行 `npm run db:generate` 重新生成 Prisma Client。

### Q2: 数据库连接失败
**A**: 
1. 检查 PostgreSQL 服务是否运行
2. 确认 `.env` 中的 `DATABASE_URL` 配置正确
3. 检查数据库用户名和密码权限

### Q3: 前端无法调用后端 API
**A**:
1. 确认后端服务在 3001 端口正常运行
2. 检查 `frontend/src/services/api.ts` 中的 API 地址
3. 查看浏览器控制台的网络请求错误信息

### Q4: 种子数据插入失败
**A**: 先执行 `npm run db:reset` 重置数据库，再执行 `npm run db:seed`。

### Q5: 跨域请求错误
**A**: 后端已配置 CORS 中间件，确保前端访问地址在 CORS 白名单中。

## ❗ 排错指南

### 数据库迁移问题
```bash
# 重置数据库（慎用！会删除所有数据）
cd backend
npm run db:reset

# 重新迁移并播种
npm run db:migrate
npm run db:seed
```

### 依赖安装问题
```bash
# 清除缓存后重新安装
rm -rf node_modules package-lock.json
npm install
```

### 端口被占用
```bash
# 查找占用端口的进程
lsof -i :3000  # 前端
lsof -i :3001  # 后端

# 结束进程
kill -9 <PID>
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范
- 使用 TypeScript 编写代码
- 遵循 ESLint 规范
- 提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)
- 新功能需要添加相应的测试

## 📝 更新日志

### v1.0.0 (2024-06-03)
- ✨ 初始版本发布
- 🎉 案件全生命周期管理功能
- 💰 多种计费模式混合计算
- 📊 绩效分配算法可视化
- 👥 多用户角色权限管理

## 🔐 安全提示

- 生产环境请务必修改 `JWT_SECRET`
- 不要将 `.env` 文件提交到版本控制
- 定期更新依赖包以修复安全漏洞
- 生产数据库请使用强密码

## 📞 技术支持

如有问题，请通过以下方式获取帮助：
1. 查看 [常见问题](#-常见问题)
2. 检查 GitHub Issues
3. 提交 Issue 描述问题

## 许可证

MIT License

---

<div align="center">

**如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！**

Made with ❤️ for Legal Tech

</div>
