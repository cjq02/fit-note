# V2Ray 安装与配置说明

## 安装步骤

1. 安装 unzip
```bash
apt install unzip
```

2. 解压 V2Ray 文件
```bash
unzip v2ray-linux-64.zip
cd v2ray
```

3. 创建必要的目录
```bash
mkdir -p /usr/local/bin/v2ray
mkdir -p /usr/local/etc/v2ray
```

4. 复制必要文件
```bash
cp v2ray /usr/local/bin/v2ray/
cp v2ctl /usr/local/bin/v2ray/
cp geoip.dat /usr/local/bin/v2ray/
cp geosite.dat /usr/local/bin/v2ray/
```

5. 设置执行权限
```bash
chmod +x /usr/local/bin/v2ray/v2ray
chmod +x /usr/local/bin/v2ray/v2ctl
```

## 配置文件

1. 创建配置文件 `/usr/local/etc/v2ray/config.json`：
```json
{
  "inbounds": [
    {
      "port": 8080,
      "listen": "0.0.0.0",
      "protocol": "http",
      "settings": {
        "timeout": 0
      }
    },
    {
      "port": 8081,
      "listen": "0.0.0.0",
      "protocol": "socks",
      "settings": {
        "auth": "noauth",
        "udp": true
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "trojan",
      "settings": {
        "servers": [
          {
            "address": "pro-iplc-hk1-1.dimsumyumcha.com",
            "port": 465,
            "password": "bVWXXAyy2qxsrnRdH9"
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "tls",
        "tlsSettings": {
          "serverName": "pro-iplc-hk1-1.dimsumyumcha.com",
          "allowInsecure": true
        }
      },
      "tag": "proxy"
    },
    {
      "protocol": "freedom",
      "settings": {},
      "tag": "direct"
    }
  ],
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      {
        "type": "field",
        "ip": ["geoip:private"],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "ip": ["0.0.0.0/0", "::/0"],
        "outboundTag": "proxy"
      }
    ]
  }
}
```

2. 创建服务文件 `/etc/systemd/system/v2ray.service`：
```ini
[Unit]
Description=V2Ray Service
After=network.target

[Service]
User=root
ExecStart=/usr/local/bin/v2ray/v2ray run -config /usr/local/etc/v2ray/config.json
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## 启动服务

1. 重新加载 systemd 配置
```bash
systemctl daemon-reload
```

2. 启动 V2Ray 服务
```bash
systemctl start v2ray
```

3. 检查服务状态
```bash
systemctl status v2ray
```

### 可选：设置开机自启

如果需要设置开机自启，可以执行：
```bash
systemctl enable v2ray
```

## 停止服务

1. 停止 V2Ray 服务
```bash
systemctl stop v2ray
```

2. 检查服务状态
```bash
systemctl status v2ray
```

### 可选：禁用开机自启

如果之前设置了开机自启，现在想要禁用，可以执行：
```bash
systemctl disable v2ray
```

## 代理设置

设置系统代理：
```bash
export http_proxy="http://127.0.0.1:8080"
export https_proxy="http://127.0.0.1:8080"
export all_proxy="socks5://127.0.0.1:8081"
```

## 验证配置

1. 检查端口是否正常监听
```bash
netstat -tuln | grep -E '8080|8081'
```

2. 测试连接
```bash
curl -v https://www.google.com
ping www.google.com
```

## 故障排查

如果遇到问题，可以查看日志：
```bash
journalctl -u v2ray -f
```

## 注意事项

1. 确保配置文件中的服务器地址、端口和密码正确
2. 确保防火墙允许相关端口访问
3. 如果修改配置，需要重启服务：
```bash
systemctl restart v2ray
```
