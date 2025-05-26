# 使用 Node.js 18 Alpine 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装 pnpm 和 nginx
RUN apk add --no-cache nginx && \
  npm install -g pnpm

# 设置淘宝镜像源
RUN pnpm config set registry https://registry.npmmirror.com/

# 复制 package.json 文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY packages/shared-utils/package.json ./packages/shared-utils/

# 复制源代码（不包含 node_modules）
COPY . .

# 安装依赖
RUN pnpm install

# 构建后端
WORKDIR /app/backend
RUN pnpm run build

# 构建前端
WORKDIR /app/frontend
RUN pnpm run build

# 配置 Nginx
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# 设置工作目录为后端目录
WORKDIR /app/backend

# 暴露端口（后端API和Nginx）
EXPOSE 3000 80

# 启动脚本
COPY start.sh /start.sh
RUN chmod +x /start.sh

# 启动服务
CMD ["/start.sh"]
