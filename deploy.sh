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
need_rebuild_backend_image=false
need_rebuild_frontend_image=false

# 检查是否有 -f 参数（强制全量部署）
force_all=false
# 新增：检查是否有 -b 参数（强制重建 docker 镜像）
force_rebuild_images=false
for arg in "$@"; do
  if [ "$arg" == "-f" ]; then
    force_all=true
    break
  fi
  if [ "$arg" == "-b" ]; then
    force_rebuild_images=true
  fi
done

if $force_all; then
  need_build_shared_utils=true
  need_build_backend=true
  need_build_frontend=true
fi
# 新增：如果有 -b 参数，强制重建 backend 和 frontend 镜像
if $force_rebuild_images; then
  need_rebuild_backend_image=true
  need_rebuild_frontend_image=true
fi

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
  if [[ $file == frontend/package.json ]]; then
    need_rebuild_frontend_image=true
  fi
  if [[ $file == backend/package.json ]]; then
    need_rebuild_backend_image=true
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
    echo "进入前端容器并构建 shared-utils..."
    docker cp packages/shared-utils/. fit-note-frontend:/app/packages/shared-utils
    docker exec -it fit-note-frontend sh -c "cd /app/packages/shared-utils && pnpm run build"
}

# 定义函数：重建前端镜像
docker_build_frontend() {
    echo "重新构建前端 Docker 镜像..."
    docker-compose -f docker-compose.prod.yml build frontend
}

# 定义函数：重建后端镜像
docker_build_backend() {
    echo "重新构建后端 Docker 镜像..."
    docker-compose -f docker-compose.prod.yml build backend
}

# 按需构建
if $need_build_shared_utils; then
    build_shared_utils
fi
if $need_rebuild_backend_image; then
    docker_build_backend
fi
if $need_rebuild_frontend_image; then
    docker_build_frontend
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
