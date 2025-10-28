#!/bin/bash

# 创建crontab文件
cat > /etc/cron.d/mongodb-backup << EOF
# 每天凌晨2点执行备份
0 2 * * * root /scripts/backup-mongodb.sh >> /var/log/mongodb-backup.log 2>&1
EOF

# 设置权限
chmod 644 /etc/cron.d/mongodb-backup

# 重启cron服务
service cron restart
