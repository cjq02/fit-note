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

## 重新编译指南

如果您需要重新编译代码而不重新构建镜像，可以使用 `recompile.sh` 脚本。该脚本允许您选择编译前端、后端或两者都编译。

### 使用方法
1. 确保 `recompile.sh` 文件具有执行权限：
   ```bash
   chmod +x recompile.sh
   ```

2. 运行脚本，并提供参数：
   - 编译前端：
     ```bash
     ./recompile.sh frontend
     ```
   - 编译后端：
     ```bash
     ./recompile.sh backend
     ```
   - 编译前端和后端：
     ```bash
     ./recompile.sh all
     ```

### 脚本功能
- 根据提供的参数决定是编译前端、后端还是两者都编译。
- 重启服务。
- 检查容器状态。
- 查看日志。

### 访问服务
- 前端页面：http://localhost
- 后端 API：http://localhost/api
- MongoDB：mongodb://localhost:27017

### MongoDB 连接信息

#### 连接字符串
```
mongodb://admin:password123@localhost:27017/fit-note?authSource=admin
```

#### VSCode 连接步骤
1. 安装 MongoDB for VS Code 扩展
2. 点击左侧 MongoDB 图标
3. 点击 "Add Connection"
4. 选择 "Connection String"
5. 输入连接字符串
6. 点击 "Connect"

#### 连接参数说明
- 主机：localhost
- 端口：27017
- 数据库：fit-note
- 用户名：admin
- 密码：password123
- 认证数据库：admin

### 环境变量
生产环境需要设置以下环境变量：
- `MONGODB_URI`：MongoDB 连接地址
- `MONGODB_USER`：MongoDB 用户名
- `MONGODB_PASS`：MongoDB 密码
- `MONGODB_AUTH_SOURCE`：MongoDB 认证数据库
- `JWT_SECRET`：JWT 密钥

这些变量已经在 `docker-compose.prod.yml` 中配置好了默认值，可以根据需要修改。

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 提交规范
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式（不影响代码运行的变动）
- refactor: 重构（既不是新增功能，也不是修改 bug 的代码变动）
- test: 增加测试
- chore: 构建过程或辅助工具的变动

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目维护者：[您的名字]
- 邮箱：[您的邮箱]
- 项目链接：[项目仓库地址]
