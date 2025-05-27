#!/bin/bash

# 检查参数
if [ -z "$1" ]; then
  echo "请指定备份文件路径"
  echo "用法: ./restore-mongodb.sh <备份文件路径>"
  exit 1
fi

BACKUP_FILE=$1
CONTAINER_NAME="fit-note-mongodb"
DB_NAME="fit-note"
TEMP_DIR="/tmp/mongodb_restore"

# 创建临时目录
mkdir -p $TEMP_DIR

# 解压备份文件
tar -xzf $BACKUP_FILE -C $TEMP_DIR

# 获取解压后的目录名
RESTORE_DIR=$(ls -t $TEMP_DIR | head -1)

# 将备份文件复制到容器
docker cp $TEMP_DIR/$RESTORE_DIR $CONTAINER_NAME:/dump

# 执行恢复
docker exec $CONTAINER_NAME mongorestore \
  --db $DB_NAME \
  --drop \
  /dump/$RESTORE_DIR/$DB_NAME

# 清理临时文件
rm -rf $TEMP_DIR

echo "MongoDB restore completed from: $BACKUP_FILE"
