# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 设置淘宝镜像源
RUN pnpm config set registry https://registry.npmmirror.com/

# 复制所有必要的文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY packages/shared-utils/package.json ./packages/shared-utils/

# 复制源代码
COPY backend/ ./backend/
COPY packages/shared-utils/ ./packages/shared-utils/

# 安装依赖并构建
RUN pnpm install
# 先构建 shared-utils
RUN cd packages/shared-utils && pnpm run build
# 再构建后端
RUN cd backend && pnpm run build

# 生产阶段
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 设置淘宝镜像源
RUN pnpm config set registry https://registry.npmmirror.com/

# 复制 package.json 文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY packages/shared-utils/package.json ./packages/shared-utils/

# 只安装生产环境依赖
RUN pnpm install --prod

# 从构建阶段复制构建产物
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/packages/shared-utils/dist ./packages/shared-utils/dist

# 设置工作目录为后端目录
WORKDIR /app/backend

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 启动后端服务
CMD ["node", "dist/main.js"]
