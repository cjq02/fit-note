# Fit-Note 健身记录应用

一个基于 React + NestJS + MongoDB 的健身记录 H5 应用，帮助用户追踪和管理他们的健身训练。

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Ant Design
- Tailwind CSS
- React Router
- Axios

### 后端
- NestJS
- TypeScript
- MongoDB
- Mongoose
- Docker

## 功能特性

- 📝 记录训练详情（日期、类型、时长、具体训练项目）
- 📊 训练数据统计和可视化
- 📱 响应式设计，支持移动端
- 🔐 用户认证和授权
- 💾 数据持久化存储

## 项目结构

```
fit-note/
├── frontend/                # React 前端项目
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API 服务
│   │   └── types/         # TypeScript 类型定义
│   └── package.json
│
├── backend/                # NestJS 后端项目
│   ├── src/
│   │   ├── workouts/      # 训练记录模块
│   │   └── users/         # 用户模块
│   └── package.json
│
└── docker-compose.yml      # Docker 配置文件
```

## 快速开始

### 环境要求

- Node.js >= 16
- pnpm >= 8
- Docker & Docker Compose
- MongoDB (通过 Docker 提供)

### 安装和运行

1. 克隆项目
```bash
git clone https://github.com/yourusername/fit-note.git
cd fit-note
```

2. 启动 MongoDB
```bash
docker-compose up -d
```

3. 安装前端依赖并启动
```bash
cd frontend
pnpm install
pnpm dev
```

4. 安装后端依赖并启动
```bash
cd backend
pnpm install
pnpm start:dev
```

前端将在 http://localhost:5173 运行
后端 API 将在 http://localhost:3000 运行

## API 文档

### 训练记录 API

- `GET /workouts` - 获取所有训练记录
- `GET /workouts/:id` - 获取单个训练记录
- `POST /workouts` - 创建新训练记录
- `PATCH /workouts/:id` - 更新训练记录
- `DELETE /workouts/:id` - 删除训练记录

## 开发指南

### 前端开发

1. 组件开发规范
   - 使用函数式组件
   - 使用 TypeScript 类型定义
   - 遵循 Ant Design 设计规范

2. 状态管理
   - 使用 React Hooks 管理本地状态
   - 使用 Context API 管理全局状态

### 后端开发

1. 模块化开发
   - 遵循 NestJS 模块化架构
   - 使用依赖注入模式
   - 实现数据验证和错误处理

2. 数据库设计
   - 使用 Mongoose Schema 定义数据模型
   - 实现数据验证和索引优化

## 部署

### 生产环境部署

1. 构建前端
```bash
cd frontend
pnpm build
```

2. 构建后端
```bash
cd backend
pnpm build
```

3. 使用 Docker Compose 部署
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目维护者：[您的名字]
- 邮箱：[您的邮箱]
- 项目链接：[项目仓库地址] 