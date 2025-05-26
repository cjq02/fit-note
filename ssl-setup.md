# SSL 证书配置说明

## 1. 安装 Certbot

```bash
# 更新包列表
sudo apt-get update

# 安装 certbot
sudo apt-get install certbot
```

## 2. 获取 SSL 证书

```bash
# 使用 standalone 模式获取证书
sudo certbot certonly --standalone -d jacquinchen.xyz -d www.jacquinchen.xyz
```

执行后会提示：
1. 输入邮箱地址（用于证书过期通知）
2. 同意服务条款
3. 是否分享邮箱给 EFF（可选）

## 3. 配置证书目录

```bash
# 创建 ssl 目录
mkdir -p ssl

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/jacquinchen.xyz/fullchain.pem ssl/jacquinchen.xyz.pem
sudo cp /etc/letsencrypt/live/jacquinchen.xyz/privkey.pem ssl/jacquinchen.xyz.key

# 设置权限
sudo chown -R $USER:$USER ssl
```

## 4. 设置证书自动续期

### 4.1 创建续期脚本

```bash
# 创建续期脚本
cat > renew-cert.sh << 'EOF'
#!/bin/bash

# 续期证书
certbot renew

# 复制新证书到项目目录
cp /etc/letsencrypt/live/jacquinchen.xyz/fullchain.pem /var/projects/fit-note/ssl/jacquinchen.xyz.pem
cp /etc/letsencrypt/live/jacquinchen.xyz/privkey.pem /var/projects/fit-note/ssl/jacquinchen.xyz.key

# 重启 Nginx 容器
docker-compose -f /var/projects/fit-note/docker-compose.prod.yml restart app
EOF

# 设置执行权限
chmod +x renew-cert.sh
```

### 4.2 配置定时任务

```bash
# 添加到 crontab（每月 1 日 0 点执行）
(crontab -l 2>/dev/null; echo "0 0 1 * * /var/projects/fit-note/renew-cert.sh") | crontab -

# 查看 crontab 配置
crontab -l
```

## 5. 证书信息

- 证书位置：`/etc/letsencrypt/live/jacquinchen.xyz/`
- 项目证书位置：`/var/projects/fit-note/ssl/`
- 证书有效期：90 天
- 自动续期：每月 1 日 0 点

## 6. 注意事项

1. 确保域名已正确解析到服务器 IP
2. 确保 80 和 443 端口在阿里云安全组中开放
3. 证书自动续期需要 80 端口可用
4. 如果续期失败，会收到邮件通知
5. 可以手动测试续期：`sudo certbot renew --dry-run`

## 7. 常用命令

```bash
# 查看证书状态
sudo certbot certificates

# 手动续期
sudo certbot renew

# 删除证书
sudo certbot delete --cert-name jacquinchen.xyz

# 查看续期日志
sudo certbot renew --dry-run --verbose
```

## 8. 故障排除

如果遇到问题，可以：

1. 检查证书状态：
```bash
sudo certbot certificates
```

2. 检查续期日志：
```bash
sudo certbot renew --dry-run --verbose
```

3. 检查 Nginx 配置：
```bash
docker exec -it fit-note-app nginx -t
```

4. 检查 Nginx 日志：
```bash
docker logs fit-note-app
```

5. 检查定时任务：
```bash
crontab -l
```

## 9. 安全建议

1. 定期检查证书状态
2. 保持 certbot 更新
3. 监控证书过期时间
4. 配置证书过期通知
5. 定期备份证书
