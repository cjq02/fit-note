#!/bin/bash

# 设置变量
BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="fit-note-mongodb"
DB_NAME="fit-note"
RETENTION_DAYS=7

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
docker exec $CONTAINER_NAME mongodump \
  --nsInclude="${DB_NAME}.*" \
  --out /dump

# 将备份文件从容器复制到主机
docker cp $CONTAINER_NAME:/dump $BACKUP_DIR/$DATE

# 压缩备份文件
cd $BACKUP_DIR
tar -czf $DATE.tar.gz $DATE
rm -rf $DATE

# 删除旧备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "MongoDB backup completed: $BACKUP_DIR/$DATE.tar.gz"
