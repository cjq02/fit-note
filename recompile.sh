#!/bin/bash

# 拉取最新的代码
echo "拉取最新的代码..."
git pull

# 检查参数
if [ "$1" == "frontend" ]; then
    echo "重新构建前端..."
    # 在容器中构建
    docker exec -it fit-note-frontend sh -c "cd /app/frontend && pnpm run build"
    # 重启容器
    docker-compose -f docker-compose.prod.yml restart frontend
elif [ "$1" == "backend" ]; then
    echo "进入后端容器并编译..."
    docker exec -it fit-note-backend sh -c "cd /app/backend && pnpm run build"
elif [ "$1" == "all" ]; then
    echo "重新构建前端..."
    docker exec -it fit-note-frontend sh -c "cd /app/frontend && pnpm run build"
    docker-compose -f docker-compose.prod.yml restart frontend
    echo "进入后端容器并编译..."
    docker exec -it fit-note-backend sh -c "cd /app/backend && pnpm run build"
else
    echo "请提供参数: frontend, backend, 或 all"
    exit 1
fi

# 检查容器状态
echo "检查容器状态..."
docker-compose ps

# 查看日志
# echo "查看日志..."
# docker-compose -f docker-compose.prod.yml logs
