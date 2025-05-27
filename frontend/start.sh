#!/bin/sh

# 构建前端
cd /app/frontend && pnpm run build

# 将构建产物复制到 nginx 目录
cp -r dist/* /usr/share/nginx/html/

# 启动 nginx
nginx -g 'daemon off;'
