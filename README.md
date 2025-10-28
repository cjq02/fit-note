# Fit-Note 健身记录应用

一个基于 React + NestJS + MongoDB 的健身记录应用，帮助用户追踪和管理他们的健身训练。

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- Ant Design
- Tailwind CSS
- React Router
- Axios
- ESLint
- Prettier

### 后端
- NestJS
- TypeScript
- MongoDB
- Mongoose
- Docker
- ESLint
- Prettier

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
│   ├── src/                # 源代码
│   ├── public/             # 静态资源
│   ├── eslint.config.js    # ESLint 配置
│   ├── .prettierrc        # Prettier 配置
│   ├── vite.config.ts     # Vite 配置
│   ├── tsconfig.json      # TypeScript 配置
│   ├── tailwind.config.js # Tailwind 配置
│   ├── postcss.config.js  # PostCSS 配置
│   ├── nginx.conf         # Nginx 配置
│   ├── Dockerfile         # Docker 配置
│   └── package.json       # 项目依赖
│
├── backend/                # NestJS 后端项目
│   ├── src/               # 源代码
│   ├── dist/              # 编译输出
│   ├── eslint.config.js   # ESLint 配置
│   ├── tsconfig.json      # TypeScript 配置
│   ├── Dockerfile         # Docker 配置
│   └── package.json       # 项目依赖
│
├── docker-compose.yml     # Docker 开发环境配置
├── docker-compose.prod.yml # Docker 生产环境配置
├── pnpm-workspace.yaml    # pnpm 工作空间配置
└── package.json           # 根项目配置
```

## 快速开始

### 环境要求

- Node.js >= 16
- pnpm >= 8
- Docker & Docker Compose
- MongoDB (通过 Docker 提供)

### 开发环境设置

1. 克隆项目
```bash
git clone https://github.com/yourusername/fit-note.git
cd fit-note
```

2. 安装依赖
```bash
pnpm install
```

3. 启动开发环境
```bash
# 启动 MongoDB
docker-compose up -d

# 启动前端开发服务器
cd frontend
pnpm dev

# 启动后端开发服务器
cd ../backend
pnpm start:dev
```

前端将在 http://localhost:5173 运行
后端 API 将在 http://localhost:3000 运行

## 工作区与包管理（pnpm workspace）

本项目使用 pnpm 工作区管理多包（monorepo）。工作区定义见 `pnpm-workspace.yaml`，包含：

- `frontend`：前端应用（Vite + React）
- `backend`：后端服务（NestJS）
- `packages/shared-utils`：共享工具包（由 tsup 打包，提供 `@fit-note/shared-utils` 包）

约定与规范：

- 包管理使用 pnpm（根、子项目保持一致版本）
- 统一使用 2 空格缩进、LF 行尾
- 日期处理统一使用 dayjs
- 所有方法添加方法注释

## 构建 shared-utils 与常见问题

前端会直接从共享包导入子路径：

```ts
import { UNIT_OPTIONS, EQUIPMENT_OPTIONS } from '@fit-note/shared-utils/dict.options';
```

共享包通过 `tsup` 产物输出到 `packages/shared-utils/dist`，并在 `package.json` 中通过 `exports` 暴露子路径：

```json
{
  "name": "@fit-note/shared-utils",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./dict.options": {
      "types": "./dist/dict.options.d.ts",
      "import": "./dist/dict.options.mjs",
      "require": "./dist/dict.options.js"
    }
  }
}
```

首次启动或拉取项目后，若未构建 shared-utils，Vite 可能报错：

> The following dependencies are imported but could not be resolved: @fit-note/shared-utils/dict.options

解决方式：

1) 在工作区根目录构建共享包

```bash
pnpm --filter @fit-note/shared-utils build
```

或使用根脚本：

```bash
pnpm build:shared-utils
```

2) 再启动前端：

```bash
cd frontend
pnpm dev
```

提示（Windows PowerShell）：如果你在 PowerShell 中执行多个命令，不要使用 `&&`，请分两行依次执行。

## 开发与启动命令

在根目录使用并行启动（需要先确保 MongoDB 已启动）：

```bash
# 启动数据库（可选：如果本地未运行 MongoDB）
docker-compose up -d

# 根目录并行启动前后端
pnpm start:parallel
```

也可以分别进入子项目启动：

```bash
# 前端
cd frontend
pnpm dev

# 后端
cd ../backend
pnpm start:dev
```

常用工作流：

- 修改了 `packages/shared-utils` 源码后：先 `pnpm --filter @fit-note/shared-utils build`，再刷新前端页面
- 修改了前端依赖或配置：在 `frontend` 目录重新安装或重启 dev server
- 生产环境一键部署：参考下文部署章节与 `deploy.sh`

## 故障排查（FAQ）

- 问：Vite 提示无法解析 `@fit-note/shared-utils/dict.options`？
  - 答：缺少共享包产物。执行 `pnpm build:shared-utils` 或 `pnpm --filter @fit-note/shared-utils build` 后再试。
- 问：PowerShell 中执行 `cd packages/shared-utils && pnpm build` 报错？
  - 答：PowerShell 不支持 `&&` 串联。请分两行执行：`cd packages/shared-utils` 回车，然后 `pnpm build`。
- 问：前端类型报错找不到共享类型？
  - 答：确认 `frontend/package.json` 依赖里存在 `"@fit-note/shared-utils": "workspace:*"`，并确保已构建 shared-utils。

## API 文档

### 训练记录 API

#### 基础 CRUD 操作
- `GET /api/workouts` - 获取所有训练记录
- `GET /api/workouts/:id` - 获取单个训练记录
- `POST /api/workouts` - 创建新训练记录
- `PUT /api/workouts/:id` - 更新训练记录
- `DELETE /api/workouts/:id` - 删除训练记录

#### 高级查询
- `GET /api/workouts/group-by-date` - 获取按日期分组的训练记录
  - 参数：
    - `page`: 页码（默认：1）
    - `pageSize`: 每页数量（默认：10）
    - `date`: 日期（可选）
    - `project`: 项目（可选）
- `GET /api/workouts/find` - 根据日期和项目ID查找训练记录
  - 参数：
    - `date`: 日期
    - `projectId`: 项目ID
- `GET /api/workouts/by-year-month` - 按年月获取训练记录
  - 参数：
    - `year`: 年份
    - `month`: 月份

## 开发指南

### 前端开发

1. 组件开发规范
   - 使用函数式组件
   - 使用 TypeScript 类型定义
   - 遵循 Ant Design 设计规范
   - 使用 Tailwind CSS 进行样式开发

2. 状态管理
   - 使用 React Hooks 管理本地状态
   - 使用 Context API 管理全局状态

3. 代码规范
   - 使用 ESLint 进行代码检查
   - 使用 Prettier 进行代码格式化

### 后端开发

1. 模块化开发
   - 遵循 NestJS 模块化架构
   - 使用依赖注入模式
   - 实现数据验证和错误处理
   - 使用 DTO 进行数据传输

2. 数据库设计
   - 使用 Mongoose Schema 定义数据模型
   - 实现数据验证和索引优化
   - 使用 MongoDB 进行数据存储

## 部署

### 生产环境部署

1. 构建并启动所有服务
```bash
# 构建并启动所有服务
docker-compose -f docker-compose.prod.yml up -d --build
```

2. 检查容器状态
```bash
docker-compose -f docker-compose.prod.yml ps
```

3. 查看服务日志
```bash
# 查看所有服务的日志
docker-compose -f docker-compose.prod.yml logs

# 实时查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 查看特定服务的日志
docker-compose -f docker-compose.prod.yml logs frontend
```

4. 重新编译服务

你可以通过 `deploy.sh` 脚本一键部署和重启服务。常用命令如下：

```bash
# 添加执行权限（首次或拉取新代码后）
chmod +x deploy.sh

# 全量部署（前端、后端、shared-utils）
./deploy.sh

# 只全量部署前端
./deploy.sh -f frontend

# 只全量部署后端
./deploy.sh -f backend
```

- 脚本会自动判断哪些模块有变更，只构建和重启需要的服务。
- 使用 `-f` 参数可强制全量部署指定模块。
- 每次修改 `deploy.sh` 文件后，建议重新赋予执行权限。

## 部署流程图（deploy.sh）

```mermaid
flowchart TD
    A[开始] --> B[记录上次commit/拉取最新代码]
    B --> C[获取变更文件]
    C --> D{参数解析 -f}
    D -->|全量| E[全部模块标记为需构建]
    D -->|只frontend| F[只标记前端需构建]
    D -->|只backend| G[只标记后端需构建]
    D --> H[根据变更文件自动标记需构建模块]
    E --> I
    F --> I
    G --> I
    H --> I
    I{需构建哪些模块?}
    I -->|shared-utils| J[build_shared_utils]
    I -->|backend| K[build_backend]
    I -->|frontend| L[build_frontend]
    J --> M[检查容器状态]
    K --> M
    L --> M
    M --> N[更新commit记录]
    N --> O[输出耗时/结束]
```

### 服务访问

- 前端页面：http://localhost
- 后端 API：http://localhost/api
- MongoDB：mongodb://localhost:27017

### MongoDB 连接信息

#### 连接字符串
```
mongodb://admin:password123@localhost:27017/fit-note?authSource=admin
```

#### 连接参数说明
- 主机：localhost
- 端口：27017
- 数据库：fit-note
- 用户名：admin
- 密码：password123
- 认证数据库：admin

### 环境变量
生产环境已配置以下环境变量：
- `MONGODB_URI`：MongoDB 连接地址
- `MONGODB_USER`：MongoDB 用户名
- `MONGODB_PASS`：MongoDB 密码
- `MONGODB_AUTH_SOURCE`：MongoDB 认证数据库
- `JWT_SECRET`：JWT 密钥

### 容器管理

#### 进入容器
```bash
# 进入前端容器
docker exec -it fit-note-frontend sh

# 进入后端容器
docker exec -it fit-note-backend sh

# 进入 MongoDB 容器
docker exec -it fit-note-mongodb sh
```

#### 停止服务
```bash
# 停止所有服务
docker-compose -f docker-compose.prod.yml down

# 停止并删除所有相关资源（包括卷）
docker-compose -f docker-compose.prod.yml down -v
```

#### 重启服务
```bash
# 重启所有服务
docker-compose -f docker-compose.prod.yml restart

# 重启特定服务
docker-compose -f docker-compose.prod.yml restart frontend
```

### Docker 系统维护
```bash
# 查看 Docker 系统资源使用情况
docker system df

# 清理未使用的 Docker 资源（不会影响正在运行的容器）
docker system prune -f
```

### 重新部署指南

根据不同的修改情况，选择以下相应的重新部署方式：

1. 仅更新源代码（未修改依赖和数据库）
```bash
# 只重启前端服务
docker-compose -f docker-compose.prod.yml restart frontend

# 只重启后端服务
docker-compose -f docker-compose.prod.yml restart backend
```

2. 修改了依赖（package.json）或 Dockerfile
```bash
# 停止服务
docker-compose -f docker-compose.prod.yml down

# 重新构建并启动服务
docker-compose -f docker-compose.prod.yml up -d --build
```

3. 修改了 docker-compose.prod.yml 配置
```bash
# 停止服务
docker-compose -f docker-compose.prod.yml down

# 重新启动服务（不重新构建）
docker-compose -f docker-compose.prod.yml up -d
```

4. 需要完全重置（包括数据库）
```bash
# 停止所有服务并删除所有数据
docker-compose -f docker-compose.prod.yml down -v

# 重新构建并启动服务
docker-compose -f docker-compose.prod.yml up -d --build
```

注意：
- 使用 `restart` 命令是最轻量级的重启方式，不会影响数据
- 使用 `--build` 参数会重新构建镜像，包括重新安装依赖
- 使用 `-v` 参数会删除所有数据卷，包括数据库数据，请谨慎使用

### 数据备份与恢复

项目提供了 MongoDB 数据库的备份和恢复脚本，位于 `scripts` 目录下。

#### 备份脚本 (backup-mongodb.sh)

用于备份 MongoDB 数据库，备份文件将保存在 `/backup/mongodb` 目录下。

```bash
# 添加执行权限
chmod +x scripts/backup-mongodb.sh

# 执行备份
./scripts/backup-mongodb.sh
```

备份脚本功能：
- 自动创建带时间戳的备份文件
- 备份文件以 `.tar.gz` 格式压缩存储
- 自动清理 7 天前的旧备份文件
- 备份文件保存在 `/backup/mongodb`
