#!/bin/sh

# 启动 Nginx
nginx

# 启动后端服务
cd /app/backend
node dist/main
