// 用户数据复制脚本 - 通过项目名称匹配复制workout记录
const SOURCE_USERNAME = 'cjq';
const TARGET_USERNAME = 'demo';

// 集合引用
const usersCol = db.getCollection('users');
const projectsCol = db.getCollection('projects');
const workoutsCol = db.getCollection('workouts');

print('=== 开始复制用户workout记录（通过项目名称匹配）===');

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

// 检测userId存储格式 - 尝试多种可能的格式
const possibleSourceUserIds = [
  SOURCE_USERNAME,                    // 用户名
  sourceUser._id,                     // ObjectId
  String(sourceUser._id),             // ObjectId字符串
  sourceUser._id.toString()            // ObjectId toString
];

const possibleTargetUserIds = [
  TARGET_USERNAME,                    // 用户名
  targetUser._id,                     // ObjectId
  String(targetUser._id),             // ObjectId字符串
  targetUser._id.toString()            // ObjectId toString
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

// 使用目标用户的ID
const targetUserId = targetUser._id;
print(`目标userId格式: ${targetUserId} (类型: ${typeof targetUserId})`);

// 建立项目名称映射（只匹配现有项目）
print('\n=== 建立项目名称映射 ===');
const projectIdMap = new Map();
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
    print(`项目 "${project.name}" 已存在，映射到现有项目 (ID: ${existing._id})`);
  } else {
    print(`项目 "${project.name}" 在目标用户中不存在，将跳过相关训练记录`);
  }
}

// 复制训练记录（通过项目名称匹配）
print('\n=== 复制训练记录（通过项目名称匹配）===');
const workoutsToInsert = [];
let workoutsSkipped = 0;
let workoutsMatchedById = 0;
let workoutsMatchedByName = 0;

for (const workout of sourceWorkouts) {
  // 查找对应的项目ID
  const projectKey = String(workout.projectId);
  let mappedProjectId = projectIdMap.get(projectKey);
  let matchMethod = '';
  
  // 如果映射失败，尝试按项目名称查找
  if (!mappedProjectId && workout.projectName) {
    const fallbackProject = projectsCol.findOne({ 
      userId: targetUserId, 
      name: workout.projectName 
    });
    if (fallbackProject) {
      mappedProjectId = fallbackProject._id;
      matchMethod = '项目名称';
      workoutsMatchedByName++;
    }
  } else if (mappedProjectId) {
    matchMethod = '项目ID映射';
    workoutsMatchedById++;
  }
  
  if (!mappedProjectId) {
    workoutsSkipped++;
    print(`跳过训练记录: 找不到对应项目 "${workout.projectName}" (日期: ${workout.date})`);
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
  print(`匹配训练记录: "${workout.projectName}" (${workout.date}) - ${matchMethod}`);
}

// 批量插入训练记录
if (workoutsToInsert.length > 0) {
  workoutsCol.insertMany(workoutsToInsert);
}

// 输出结果
print('\n=== 复制完成 ===');
print(`项目统计:`);
print(`  - 成功映射: ${projectsMapped}`);
print(`  - 总计检查: ${sourceProjects.length}`);
print(`训练记录统计:`);
print(`  - 成功复制: ${workoutsToInsert.length}`);
print(`  - 通过项目ID映射: ${workoutsMatchedById}`);
print(`  - 通过项目名称匹配: ${workoutsMatchedByName}`);
print(`  - 跳过: ${workoutsSkipped}`);
print(`  - 总计处理: ${workoutsToInsert.length + workoutsSkipped}`);

print('\n复制完成！通过项目名称匹配成功复制了workout记录。');
