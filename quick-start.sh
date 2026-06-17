#!/bin/bash

echo "=========================================="
echo "   案件全生命周期管理平台 - 快速启动"
echo "=========================================="
echo ""

echo "检查 Node.js 版本..."
node --version

echo ""
echo "安装根目录依赖..."
npm install

echo ""
echo "安装后端依赖..."
cd backend && npm install

echo ""
echo "生成 Prisma Client..."
npm run db:generate

echo ""
echo "=========================================="
echo "  数据库配置说明"
echo "=========================================="
echo "请确保 PostgreSQL 已安装并运行"
echo "创建数据库后，修改 backend/.env 中的数据库连接信息"
echo ""
echo "然后执行以下命令："
echo "  cd backend"
echo "  npm run db:migrate    # 执行数据库迁移"
echo "  npm run db:seed       # 插入测试数据（可选）"
echo "  npm run dev           # 启动后端服务"
echo ""
echo "新打开终端启动前端："
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "访问 http://localhost:3000"
echo "测试账号: admin / 123456"
echo "=========================================="
