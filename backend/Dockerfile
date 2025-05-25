# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制整个项目文件
COPY . .

# 安装所有依赖
RUN pnpm install

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:18-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制整个项目文件
COPY . .

# 只安装生产依赖
RUN pnpm install --prod

# 从构建阶段复制构建产物
COPY --from=builder /app/backend/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
