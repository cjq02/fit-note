// 专门复制训练项目的脚本
const SOURCE_USERNAME = 'cjq';
const TARGET_USERNAME = 'demo'; // 目标用户名

// 集合引用
const usersCol = db.getCollection('users');
const projectsCol = db.getCollection('projects');

print('=== 复制训练项目 ===');

// 查找源用户和目标用户
const sourceUser = usersCol.findOne({ username: SOURCE_USERNAME });
const targetUser = usersCol.findOne({ username: TARGET_USERNAME });

if (!sourceUser) {
  print(`错误: 未找到源用户 ${SOURCE_USERNAME}`);
  quit(1);
}
if (!targetUser) {
  print(`错误: 未找到目标用户 ${TARGET_USERNAME}`);
  quit(1);
}

print(`源用户: ${SOURCE_USERNAME} (ID: ${sourceUser._id})`);
print(`目标用户: ${TARGET_USERNAME} (ID: ${targetUser._id})`);

// 检测userId存储格式
const possibleSourceUserIds = [
  SOURCE_USERNAME,                    // 用户名
  sourceUser._id,                     // ObjectId
  String(sourceUser._id),             // ObjectId字符串
  sourceUser._id.toString()            // ObjectId toString
];

// 目标用户ID格式 - 尝试多种可能的格式
const possibleTargetUserIds = [
  TARGET_USERNAME,                    // 用户名
  targetUser._id,                     // ObjectId
  String(targetUser._id),             // ObjectId字符串
  targetUser._id.toString()            // ObjectId toString
];

// 检测目标用户的实际userId格式
let targetUserId = null;
for (const userId of possibleTargetUserIds) {
  const existing = projectsCol.findOne({ userId: userId });
  if (existing) {
    targetUserId = userId;
    print(`目标用户已有项目，userId格式: ${userId} (类型: ${typeof userId})`);
    break;
  }
}

print('\n检测源用户项目数据...');

// 查找源用户的项目数据
let sourceProjects = [];
let actualSourceUserId = null;

// 尝试不同的userId格式查找数据
for (const userId of possibleSourceUserIds) {
  const projects = projectsCol.find({ userId: userId }).toArray();
  
  if (projects.length > 0) {
    sourceProjects = projects;
    actualSourceUserId = userId;
    print(`找到项目数据 - userId格式: ${userId} (类型: ${typeof userId})`);
    print(`项目数量: ${projects.length}`);
    break;
  }
}

if (sourceProjects.length === 0) {
  print(`警告: 未找到用户 ${SOURCE_USERNAME} 的任何项目`);
  print('尝试的userId格式:', possibleSourceUserIds);
  
  // 显示所有用户的项目分布
  print('\n所有用户的项目分布:');
  db.projects.aggregate([
    { $group: { _id: "$userId", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]).forEach(doc => {
    print(`userId: ${doc._id} (类型: ${typeof doc._id}), 项目数: ${doc.count}`);
  });
  
  quit(0);
}

print(`目标userId格式: ${targetUserId} (类型: ${typeof targetUserId})`);

// 复制项目
print('\n=== 开始复制项目 ===');
let projectsCopied = 0;
let projectsSkipped = 0;

for (const project of sourceProjects) {
  print(`\n处理项目: "${project.name}"`);
  
  // 检查目标用户是否已有同名项目
  const existing = projectsCol.findOne({ 
    userId: targetUserId, 
    name: project.name 
  });
  
  if (existing) {
    projectsSkipped++;
    print(`  - 跳过: 目标用户已有同名项目`);
    continue;
  }
  
  // 创建新项目
  const newProject = {
    name: project.name,
    description: project.description || '',
    userId: targetUserId,
    seqNo: project.seqNo || 0,
    category: project.category || '',
    defaultUnit: project.defaultUnit || 'kg',
    defaultWeight: project.defaultWeight || 0,
    equipments: project.equipments || [],
    createdAt: project.createdAt || new Date(),
    updatedAt: new Date()
  };
  
  try {
    const result = projectsCol.insertOne(newProject);
    projectsCopied++;
    print(`  - 成功创建: 新ID ${result.insertedId}`);
  } catch (error) {
    print(`  - 创建失败: ${error.message}`);
  }
}

// 输出结果
print('\n=== 复制完成 ===');
print(`项目统计:`);
print(`  - 成功创建: ${projectsCopied}`);
print(`  - 跳过(已存在): ${projectsSkipped}`);
print(`  - 总计处理: ${projectsCopied + projectsSkipped}`);

// 验证结果
print('\n=== 验证结果 ===');
const targetProjects = projectsCol.find({ userId: targetUserId }).toArray();
print(`目标用户 "${TARGET_USERNAME}" 现在有 ${targetProjects.length} 个项目:`);
targetProjects.forEach(p => print(`  - ${p.name} (${p.category})`));

print('\n项目复制完成！');
