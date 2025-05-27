#!/bin/bash

# 设置变量
BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="fit-note-mongodb"
DB_NAME="fit-note"
RETENTION_DAYS=7
MONGO_USER="admin"
MONGO_PASS="password123"
MONGO_AUTH_DB="admin"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
docker exec $CONTAINER_NAME mongodump \
  --db $DB_NAME \
  --username $MONGO_USER \
  --password $MONGO_PASS \
  --authenticationDatabase $MONGO_AUTH_DB \
  --out /dump/$DATE

# 将备份文件从容器复制到主机
docker cp $CONTAINER_NAME:/dump/$DATE $BACKUP_DIR/

# 压缩备份文件
cd $BACKUP_DIR
tar -czf $DATE.tar.gz $DATE
rm -rf $DATE

# 删除旧备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "MongoDB backup completed: $BACKUP_DIR/$DATE.tar.gz"


#  chmod -x scripts/backup-mongodb.sh
#  chmod -x scripts/restore-mongodb.sh

#  chmod +x scripts/backup-mongodb.sh
#  chmod +x scripts/restore-mongodb.sh
#  rm -f /backup/mongodb/*
