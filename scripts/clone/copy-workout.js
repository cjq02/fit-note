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
const targetUserId = String(targetUser._id);
print(`目标userId格式: ${targetUserId} (类型: ${typeof targetUserId})`);

// 建立项目映射关系（源项目ID -> 目标项目ID）
print('\n=== 建立项目映射关系 ===');
const projectIdMap = new Map();
let projectsMapped = 0;
let projectsNotFound = 0;

print('源用户项目列表:');
sourceProjects.forEach((project, index) => {
  print(`  ${index + 1}. "${project.name}" (ID: ${project._id})`);
});

print('\n目标用户项目列表:');
const targetProjects = projectsCol.find({ userId: targetUserId }).toArray();
targetProjects.forEach((project, index) => {
  print(`  ${index + 1}. "${project.name}" (ID: ${project._id})`);
});

print('\n开始建立映射关系:');
for (const sourceProject of sourceProjects) {
  // 检查目标用户是否已有同名项目
  const targetProject = projectsCol.findOne({ 
    userId: targetUserId, 
    name: sourceProject.name 
  });
  
  if (targetProject) {
    // 建立映射：源项目ID -> 目标项目ID
    projectIdMap.set(String(sourceProject._id), targetProject._id);
    projectsMapped++;
    print(`✓ 项目 "${sourceProject.name}" 映射成功:`);
    print(`  源ID: ${sourceProject._id} -> 目标ID: ${targetProject._id}`);
  } else {
    projectsNotFound++;
    print(`✗ 项目 "${sourceProject.name}" 在目标用户中不存在，将跳过相关训练记录`);
  }
}

print(`\n映射统计: 成功映射 ${projectsMapped} 个，未找到 ${projectsNotFound} 个`);

// 复制训练记录（使用已建立的项目映射）
print('\n=== 复制训练记录（使用项目映射）===');
const workoutsToInsert = [];
let workoutsSkipped = 0;
let workoutsMatched = 0;

print(`开始处理 ${sourceWorkouts.length} 条训练记录...`);

for (const workout of sourceWorkouts) {
  // 使用已建立的项目映射查找对应的目标项目ID
  const sourceProjectId = String(workout.projectId);
  const mappedProjectId = projectIdMap.get(sourceProjectId);
  
  if (!mappedProjectId) {
    workoutsSkipped++;
    print(`✗ 跳过训练记录: 项目 "${workout.projectName}" 未建立映射 (日期: ${workout.date})`);
    continue;
  }
  
  // 创建新的训练记录，使用映射后的项目ID
  const newWorkout = {
    userId: targetUserId,
    date: workout.date,
    projectId: mappedProjectId,  // 使用映射后的目标项目ID
    projectName: workout.projectName,
    unit: workout.unit || 'kg',
    groups: workout.groups || [],
    trainingTime: workout.trainingTime || 0,
    remark: workout.remark || '',
    createdAt: workout.createdAt || new Date(),
    updatedAt: new Date()
  };
  
  workoutsToInsert.push(newWorkout);
  workoutsMatched++;
  print(`✓ 匹配训练记录: "${workout.projectName}" (${workout.date}) - 项目ID: ${sourceProjectId} -> ${mappedProjectId}`);
}

// 批量插入训练记录
if (workoutsToInsert.length > 0) {
  workoutsCol.insertMany(workoutsToInsert);
}

// 输出结果
print('\n=== 复制完成 ===');
print(`项目映射统计:`);
print(`  - 成功映射: ${projectsMapped}`);
print(`  - 未找到: ${projectsNotFound}`);
print(`  - 总计检查: ${sourceProjects.length}`);
print(`训练记录统计:`);
print(`  - 成功复制: ${workoutsToInsert.length}`);
print(`  - 成功匹配: ${workoutsMatched}`);
print(`  - 跳过: ${workoutsSkipped}`);
print(`  - 总计处理: ${workoutsToInsert.length + workoutsSkipped}`);

print('\n复制完成！通过项目名称匹配和ID映射成功复制了workout记录。');
