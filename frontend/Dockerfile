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
COPY frontend/package.json ./frontend/
COPY packages/shared-utils/package.json ./packages/shared-utils/

# 复制源代码
COPY frontend/ ./frontend/
COPY packages/shared-utils/ ./packages/shared-utils/

# 安装依赖并构建
RUN pnpm install

# 先构建 shared-utils
RUN pnpm --filter "shared-utils" run build

# 再构建 frontend
RUN pnpm --filter "frontend" run build
