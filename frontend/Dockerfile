# 使用 Node.js 作为基础镜像
FROM node:18-alpine

# 安装 pnpm
RUN npm install -g pnpm

# 设置淘宝镜像源
RUN pnpm config set registry https://registry.npmmirror.com/

# 设置工作目录
WORKDIR /app

# 复制所有必要的文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/
COPY packages/shared-utils/package.json ./packages/shared-utils/

# 复制源代码
COPY frontend/ ./frontend/
COPY packages/shared-utils/ ./packages/shared-utils/

# 安装依赖
RUN pnpm install

# 安装 nginx
RUN apk add --no-cache nginx

# 配置 Nginx
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动脚本
COPY frontend/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# 启动服务
CMD ["/app/start.sh"]
