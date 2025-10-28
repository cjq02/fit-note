# 数据生成脚本使用说明

## 概述

本目录包含用于生成和管理 demo 用户模拟 workout 数据的脚本。

## 脚本文件

### 1. generate-demo-workouts.js
主要的 workout 数据生成脚本，支持生成指定年月的模拟训练数据。

**特点：**
- 支持自定义年份和月份参数
- 7天中有4天训练（约57%概率）
- 每天训练2-7个项目
- 最多使用3个不同的项目类别
- 生成真实的训练组数据（重量、次数、休息时间）

### 2. run-generate-workouts.sh
Linux/Mac 系统的 Docker 执行脚本，简化参数传递和容器管理。

### 3. copy-workout.js
通过项目名称匹配复制用户 workout 记录的脚本。

### 4. copy-projects-only.js
仅复制项目数据的脚本。

## 使用方法

### 生成模拟数据

#### 方法1：使用 shell 脚本（推荐）
```bash
# 给脚本执行权限
chmod +x scripts/clone/run-generate-workouts.sh

# 生成 2024年10月的数据
./scripts/clone/run-generate-workouts.sh 2024 10

# 生成 2025年8月的数据
./scripts/clone/run-generate-workouts.sh 2025 8
```

#### 方法2：直接使用 Docker 命令
```bash
# 1. 复制脚本到容器
docker cp scripts/clone/generate-demo-workouts.js fit-note-mongodb:/tmp/

# 2. 进入 MongoDB shell
docker exec -it fit-note-mongodb mongosh --username admin --password password123 --authenticationDatabase admin fit-note

# 3. 在 shell 中执行
const YEAR = 2024;
const MONTH = 10;
load('/tmp/generate-demo-workouts.js');
```

#### 方法3：使用临时脚本文件
```bash
# 创建临时脚本
cat > temp-script.js << EOF
const YEAR = 2024;
const MONTH = 10;
load('/tmp/generate-demo-workouts.js');
EOF

# 复制到容器并执行
docker cp temp-script.js fit-note-mongodb:/tmp/
docker cp scripts/clone/generate-demo-workouts.js fit-note-mongodb:/tmp/
docker exec -it fit-note-mongodb mongosh --username admin --password password123 --authenticationDatabase admin fit-note --file /tmp/temp-script.js

# 清理临时文件
rm temp-script.js
```

### 复制用户数据

#### 复制 workout 记录
```bash
docker cp scripts/clone/copy-workout.js fit-note-mongodb:/tmp/
docker exec -it fit-note-mongodb mongosh --username admin --password password123 --authenticationDatabase admin fit-note --file /tmp/copy-workout.js
```

#### 仅复制项目数据
```bash
docker cp scripts/clone/copy-projects-only.js fit-note-mongodb:/tmp/
docker exec -it fit-note-mongodb mongosh --username admin --password password123 --authenticationDatabase admin fit-note --file /tmp/copy-projects-only.js
```

### 删除数据

#### 删除 10 月份数据
```bash
docker cp playground/delete-demo-october-workouts.mongodb.js fit-note-mongodb:/tmp/
docker exec -it fit-note-mongodb mongosh --username admin --password password123 --authenticationDatabase admin fit-note --file /tmp/delete-demo-october-workouts.mongodb.js
```

## 参数说明

### generate-demo-workouts.js 参数

| 参数 | 类型 | 必需 | 范围 | 说明 |
|------|------|------|------|------|
| YEAR | Number | 是 | 2000-2100 | 要生成数据的年份 |
| MONTH | Number | 是 | 1-12 | 要生成数据的月份 |

### 生成规则

1. **训练频率**：7天中有4天训练（约57%概率）
2. **项目数量**：每天训练2-7个项目
3. **类别限制**：最多使用3个不同的项目类别
4. **训练组数**：每个项目1-5组
5. **重量范围**：基于项目默认重量的80%-120%
6. **次数范围**：每组5-15次
7. **休息时间**：30-60秒（最后一组为0）
8. **训练时间**：20-90分钟

## 注意事项

1. **必需参数**：generate-demo-workouts.js 必须传入 YEAR 和 MONTH 参数
2. **数据格式**：生成的日期格式为字符串 "YYYY-MM-DD"
3. **容器状态**：确保 MongoDB 容器正在运行
4. **权限问题**：确保脚本有执行权限
5. **数据备份**：建议在生成大量数据前先备份现有数据

## 故障排除

### 常见错误

1. **参数未定义**：确保在脚本中定义了 YEAR 和 MONTH 变量
2. **容器未运行**：使用 `docker-compose up -d mongodb` 启动容器
3. **路径错误**：确保脚本路径正确
4. **权限不足**：使用 `chmod +x` 给脚本执行权限

### 调试方法

1. 检查容器状态：`docker ps | grep mongodb`
2. 查看容器日志：`docker logs fit-note-mongodb`
3. 进入容器调试：`docker exec -it fit-note-mongodb mongosh --username admin --password password123 --authenticationDatabase admin fit-note`
