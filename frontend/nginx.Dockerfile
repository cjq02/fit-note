# 使用 nginx 官方镜像
FROM nginx:alpine

# 配置 Nginx
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
