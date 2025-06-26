#!/bin/bash

start_time=$(date +%s)
echo "部署开始时间: $(date '+%Y-%m-%d %H:%M:%S')"

# 记录上次commit
last_commit=$(cat .last_deploy_commit 2>/dev/null || git rev-parse HEAD)

# 拉取最新的代码
echo "拉取最新的代码..."
git pull

# 获取变更文件
changed_files=$(git diff --name-only $last_commit HEAD)

# 判断哪些模块有变动
need_build_frontend=false
need_build_backend=false
need_build_shared_utils=false

for file in $changed_files; do
  if [[ $file == frontend/* ]]; then
    need_build_frontend=true
  fi
  if [[ $file == backend/* ]]; then
    need_build_backend=true
  fi
  if [[ $file == packages/shared-utils/* ]]; then
    need_build_shared_utils=true
    need_build_frontend=true
    need_build_backend=true
  fi
done

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
    # 重启后端容器以运行新的构建结果
    echo "重启后端容器..."
    docker-compose -f docker-compose.prod.yml restart backend
}

# 定义函数：检查容器状态
check_containers() {
    echo "检查容器状态..."
    docker-compose ps
}

# 定义函数：构建 shared-utils
build_shared_utils() {
    echo "同步文件到 shared-utils 容器..."
    docker cp packages/shared-utils/. fit-note-backend:/app/packages/shared-utils/
    echo "进入后端容器并构建 shared-utils..."
    docker exec -it fit-note-backend sh -c "cd /app/packages/shared-utils && pnpm run build"
}

# 按需构建
if $need_build_shared_utils; then
    build_shared_utils
fi
if $need_build_backend; then
    build_backend
fi
if $need_build_frontend; then
    build_frontend
fi

# 检查容器状态
check_containers

# 更新commit记录
git rev-parse HEAD > .last_deploy_commit

# 查看日志
# echo "查看日志..."
# docker-compose -f docker-compose.prod.yml logs

echo "部署结束时间: $(date '+%Y-%m-%d %H:%M:%S')"
end_time=$(date +%s)
elapsed_time=$((end_time - start_time))
echo "部署总耗时: ${elapsed_time} 秒"
