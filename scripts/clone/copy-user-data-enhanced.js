// 增强版用户数据复制脚本 - 自动检测userId格式
const SOURCE_USERNAME = 'cjq';
const TARGET_USER_ID = '6836ff9a7f5f9b2d0e326bc9'; // demo用户的userId

// 集合引用
const usersCol = db.getCollection('users');
const projectsCol = db.getCollection('projects');
const workoutsCol = db.getCollection('workouts');

print('=== 开始复制用户数据 ===');

// 查找源用户
const sourceUser = usersCol.findOne({ username: SOURCE_USERNAME });

if (!sourceUser) {
  print(`错误: 未找到源用户 ${SOURCE_USERNAME}`);
  quit(1);
}

print(`源用户: ${SOURCE_USERNAME} (ID: ${sourceUser._id})`);
print(`目标用户ID: ${TARGET_USER_ID}`);

// 检测userId存储格式 - 尝试多种可能的格式
const possibleSourceUserIds = [
  SOURCE_USERNAME,                    // 用户名
  sourceUser._id,                     // ObjectId
  String(sourceUser._id),             // ObjectId字符串
  sourceUser._id.toString()            // ObjectId toString
];

const possibleTargetUserIds = [
  TARGET_USER_ID,                     // 已知的ObjectId字符串
  ObjectId(TARGET_USER_ID)            // ObjectId对象
];

print('检测源用户数据格式...');

// 查找源用户的项目和训练数据
let sourceProjects = [];
let sourceWorkouts = [];
let actualSourceUserId = null;

// 尝试不同的userId格式查找数据
for (const userId of possibleSourceUserIds) {
  const projects = projectsCol.find({ userId: userId }).toArray();
  const workouts = workoutsCol.find({ userId: userId }).toArray();
  
  if (projects.length > 0 || workouts.length > 0) {
    sourceProjects = projects;
    sourceWorkouts = workouts;
    actualSourceUserId = userId;
    print(`找到数据 - userId格式: ${userId} (类型: ${typeof userId})`);
    print(`项目数量: ${projects.length}, 训练数量: ${workouts.length}`);
    break;
  }
}

if (sourceProjects.length === 0 && sourceWorkouts.length === 0) {
  print(`警告: 未找到用户 ${SOURCE_USERNAME} 的任何数据`);
  print('尝试的userId格式:', possibleSourceUserIds);
  quit(0);
}

// 使用已知的目标用户ID
const targetUserId = TARGET_USER_ID;
print(`目标userId格式: ${targetUserId} (类型: ${typeof targetUserId})`);

// 复制项目
print('\n=== 复制项目 ===');
const projectIdMap = new Map();
let projectsCopied = 0;
let projectsMapped = 0;

for (const project of sourceProjects) {
  // 检查目标用户是否已有同名项目
  const existing = projectsCol.findOne({ 
    userId: targetUserId, 
    name: project.name 
  });
  
  if (existing) {
    projectIdMap.set(String(project._id), existing._id);
    projectsMapped++;
    print(`项目 "${project.name}" 已存在，映射到现有项目`);
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
  
  const result = projectsCol.insertOne(newProject);
  projectIdMap.set(String(project._id), result.insertedId);
  projectsCopied++;
  print(`创建项目: "${project.name}"`);
}

// 复制训练记录
print('\n=== 复制训练记录 ===');
const workoutsToInsert = [];
let workoutsSkipped = 0;

for (const workout of sourceWorkouts) {
  // 查找对应的项目ID
  const projectKey = String(workout.projectId);
  let mappedProjectId = projectIdMap.get(projectKey);
  
  // 如果映射失败，尝试按项目名称查找
  if (!mappedProjectId && workout.projectName) {
    const fallbackProject = projectsCol.findOne({ 
      userId: targetUserId, 
      name: workout.projectName 
    });
    if (fallbackProject) {
      mappedProjectId = fallbackProject._id;
    }
  }
  
  if (!mappedProjectId) {
    workoutsSkipped++;
    print(`跳过训练记录: 找不到对应项目 "${workout.projectName}"`);
    continue;
  }
  
  const newWorkout = {
    userId: targetUserId,
    date: workout.date,
    projectId: mappedProjectId,
    projectName: workout.projectName,
    unit: workout.unit || 'kg',
    groups: workout.groups || [],
    trainingTime: workout.trainingTime || 0,
    remark: workout.remark || '',
    createdAt: workout.createdAt || new Date(),
    updatedAt: new Date()
  };
  
  workoutsToInsert.push(newWorkout);
}

// 批量插入训练记录
if (workoutsToInsert.length > 0) {
  workoutsCol.insertMany(workoutsToInsert);
}

// 输出结果
print('\n=== 复制完成 ===');
print(`项目统计:`);
print(`  - 新创建: ${projectsCopied}`);
print(`  - 映射到现有: ${projectsMapped}`);
print(`  - 总计处理: ${projectsCopied + projectsMapped}`);
print(`训练记录统计:`);
print(`  - 成功复制: ${workoutsToInsert.length}`);
print(`  - 跳过: ${workoutsSkipped}`);
print(`  - 总计处理: ${workoutsToInsert.length + workoutsSkipped}`);

print('\n复制完成！');
