#!/bin/bash

# 定义函数：构建前端
build_frontend() {
    echo "重新构建前端..."
    # 同步文件到容器
    echo "同步文件到前端容器..."
    docker cp frontend/. fit-note-frontend:/app/frontend/
    # 在容器中构建
    docker exec -it fit-note-frontend sh -c "cd /app/frontend && pnpm run build"
    # 重启容器
    echo "重启 nginx 容器..."
    docker-compose -f docker-compose.prod.yml restart nginx
}

# 定义函数：构建后端
build_backend() {
    echo "同步文件到后端容器..."
    docker cp backend/. fit-note-backend:/app/backend/
    echo "进入后端容器并编译..."
    docker exec -it fit-note-backend sh -c "cd /app/backend && pnpm run build"
}

# 定义函数：检查容器状态
check_containers() {
    echo "检查容器状态..."
    docker-compose ps
}

# 拉取最新的代码
echo "拉取最新的代码..."
git pull

# 检查参数
if [ "$1" == "frontend" ]; then
    build_frontend
elif [ "$1" == "backend" ]; then
    build_backend
elif [ "$1" == "all" ]; then
    build_frontend
    build_backend
else
    echo "请提供参数: frontend, backend, 或 all"
    exit 1
fi

# 检查容器状态
check_containers

# 查看日志
# echo "查看日志..."
# docker-compose -f docker-compose.prod.yml logs
