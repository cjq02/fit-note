#!/bin/bash

# 生成 demo 用户模拟 workout 数据的 Docker 脚本
# 使用方法: ./run-generate-workouts.sh [YEAR] [MONTH]
# 例如: ./run-generate-workouts.sh 2024 10

# 检查参数
if [ $# -ne 2 ]; then
    echo "使用方法: $0 <YEAR> <MONTH>"
    echo "例如: $0 2024 10"
    exit 1
fi

YEAR=$1
MONTH=$2

# 验证参数
if ! [[ "$YEAR" =~ ^[0-9]+$ ]] || [ "$YEAR" -lt 2000 ] || [ "$YEAR" -gt 2100 ]; then
    echo "错误: 年份必须是 2000-2100 之间的数字"
    exit 1
fi

if ! [[ "$MONTH" =~ ^[0-9]+$ ]] || [ "$MONTH" -lt 1 ] || [ "$MONTH" -gt 12 ]; then
    echo "错误: 月份必须是 1-12 之间的数字"
    exit 1
fi

echo "=== 生成 demo 用户 ${YEAR}年${MONTH}月模拟 workout 数据 ==="

# 检查 Docker 容器是否运行
if ! docker ps | grep -q "fit-note-mongodb"; then
    echo "启动 MongoDB 容器..."
    docker-compose up -d mongodb
    sleep 5
fi

# 创建临时脚本文件
TEMP_SCRIPT="/tmp/generate-workouts-${YEAR}-${MONTH}.js"

cat > "$TEMP_SCRIPT" << EOF
// 设置参数
const YEAR = ${YEAR};
const MONTH = ${MONTH};

// 加载主脚本
load('/scripts/clone/generate-demo-workouts.js');
EOF

echo "创建临时脚本: $TEMP_SCRIPT"

# 将脚本复制到容器
docker cp "$TEMP_SCRIPT" fit-note-mongodb:/tmp/temp-script.js
docker cp "scripts/clone/generate-demo-workouts.js" fit-note-mongodb:/scripts/clone/generate-demo-workouts.js

# 执行脚本
echo "执行生成脚本..."
docker exec -it fit-note-mongodb mongosh --username admin --password password123 --authenticationDatabase admin fit-note --file /tmp/temp-script.js

# 清理临时文件
rm -f "$TEMP_SCRIPT"
docker exec fit-note-mongodb rm -f /tmp/temp-script.js

echo "完成！"
