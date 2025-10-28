// 生成 demo 用户 10 月份模拟 workout 数据
const TARGET_USERNAME = 'demo';

// 集合引用
const usersCol = db.getCollection('users');
const projectsCol = db.getCollection('projects');
const workoutsCol = db.getCollection('workouts');

print('=== 生成 demo 用户 10 月份模拟 workout 数据 ===');

// 查找目标用户
const targetUser = usersCol.findOne({ username: TARGET_USERNAME });

if (!targetUser) {
  print(`错误: 未找到目标用户 ${TARGET_USERNAME}`);
  quit(1);
}

const targetUserId = String(targetUser._id);
print(`目标用户: ${TARGET_USERNAME} (ID: ${targetUserId})`);

// 获取目标用户的项目
const userProjects = projectsCol.find({ userId: targetUserId }).toArray();

if (userProjects.length === 0) {
  print(`错误: 目标用户 ${TARGET_USERNAME} 没有项目数据`);
  quit(1);
}

print(`找到 ${userProjects.length} 个项目`);

// 按类别分组项目
const projectsByCategory = {};
userProjects.forEach(project => {
  const category = project.category || '未分类';
  if (!projectsByCategory[category]) {
    projectsByCategory[category] = [];
  }
  projectsByCategory[category].push(project);
});

const categories = Object.keys(projectsByCategory);
print(`项目类别: ${categories.join(', ')}`);

// 确保类别不超过3个
const selectedCategories = categories.slice(0, 3);
print(`使用类别: ${selectedCategories.join(', ')}`);

// 生成10月份的训练数据
const year = 2024;
const month = 10; // 10月
const daysInMonth = 31;

// 获取今天的日期
const today = new Date();
const todayDate = today.getDate();

// 确保不生成大于今天的数据
const maxDay = Math.min(daysInMonth, todayDate);

print(`生成 10月1日 到 10月${maxDay}日 的训练数据`);

// 生成训练日期：7天中有4天训练
const trainingDays = [];
for (let day = 1; day <= maxDay; day++) {
  // 使用日期作为种子，确保每天的训练安排是固定的
  const seed = day * 7 + month * 31 + year;
  const random = (seed * 9301 + 49297) % 233280 / 233280;
  
  // 7天中有4天训练，即约57%的概率
  if (random < 0.57) {
    trainingDays.push(day);
  }
}

print(`训练天数: ${trainingDays.length} 天`);
print(`训练日期: ${trainingDays.join(', ')}`);

// 生成训练记录
const workoutsToInsert = [];
let totalWorkouts = 0;

trainingDays.forEach(day => {
  const trainingDate = new Date(year, month - 1, day);
  
  // 每天2到7个项目
  const seed = day * 13 + month * 7 + year;
  const random = (seed * 9301 + 49297) % 233280 / 233280;
  const projectCount = Math.floor(random * 6) + 2; // 2-7个项目
  
  // 从选定的类别中随机选择项目
  const selectedProjects = [];
  const usedProjects = new Set();
  
  for (let i = 0; i < projectCount; i++) {
    // 随机选择一个类别
    const categorySeed = (seed + i * 17) * 9301 + 49297;
    const categoryRandom = (categorySeed % 233280) / 233280;
    const selectedCategory = selectedCategories[Math.floor(categoryRandom * selectedCategories.length)];
    
    // 从该类别中随机选择一个未使用的项目
    const categoryProjects = projectsByCategory[selectedCategory];
    const availableProjects = categoryProjects.filter(p => !usedProjects.has(p._id.toString()));
    
    if (availableProjects.length > 0) {
      const projectSeed = (seed + i * 23) * 9301 + 49297;
      const projectRandom = (projectSeed % 233280) / 233280;
      const selectedProject = availableProjects[Math.floor(projectRandom * availableProjects.length)];
      
      selectedProjects.push(selectedProject);
      usedProjects.add(selectedProject._id.toString());
    }
  }
  
  print(`10月${day}日: ${selectedProjects.length} 个项目 (${selectedProjects.map(p => p.name).join(', ')})`);
  
  // 为每个项目生成训练记录
  selectedProjects.forEach(project => {
    // 生成训练组数 (1-5组)
    const groupSeed = (day * 19 + project._id.toString().charCodeAt(0)) * 9301 + 49297;
    const groupRandom = (groupSeed % 233280) / 233280;
    const groupCount = Math.floor(groupRandom * 5) + 1;
    
    // 生成训练组数据
    const groups = [];
    for (let g = 0; g < groupCount; g++) {
      // 生成重量 (项目默认重量的80%-120%)
      const weightSeed = (groupSeed + g * 11) * 9301 + 49297;
      const weightRandom = (weightSeed % 233280) / 233280;
      const baseWeight = project.defaultWeight || 0;
      const weight = Math.round((baseWeight * (0.8 + weightRandom * 0.4)) * 10) / 10;
      
      // 生成次数 (5-15次)
      const repsSeed = (weightSeed + g * 7) * 9301 + 49297;
      const repsRandom = (repsSeed % 233280) / 233280;
      const reps = Math.floor(repsRandom * 11) + 5;
      
      groups.push({
        weight: weight,
        reps: reps,
        rest: 60 + Math.floor(repsRandom * 120) // 60-180秒休息
      });
    }
    
    // 生成训练时间 (20-90分钟)
    const timeSeed = (day * 29 + project._id.toString().charCodeAt(1)) * 9301 + 49297;
    const timeRandom = (timeSeed % 233280) / 233280;
    const trainingTime = Math.floor(timeRandom * 70) + 20;
    
    const workout = {
      userId: targetUserId,
      date: trainingDate,
      projectId: project._id,
      projectName: project.name,
      unit: project.defaultUnit || 'kg',
      groups: groups,
      trainingTime: trainingTime,
      remark: `模拟训练数据 - ${project.category || '未分类'}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    workoutsToInsert.push(workout);
    totalWorkouts++;
  });
});

// 批量插入训练记录
if (workoutsToInsert.length > 0) {
  workoutsCol.insertMany(workoutsToInsert);
  print(`\n成功插入 ${workoutsToInsert.length} 条训练记录`);
} else {
  print('\n没有生成任何训练记录');
}

// 输出统计信息
print('\n=== 生成完成 ===');
print(`训练天数: ${trainingDays.length}`);
print(`总训练记录: ${totalWorkouts}`);
print(`平均每天项目数: ${(totalWorkouts / trainingDays.length).toFixed(1)}`);

// 按类别统计
const categoryStats = {};
workoutsToInsert.forEach(workout => {
  const project = userProjects.find(p => p._id.toString() === workout.projectId.toString());
  const category = project?.category || '未分类';
  categoryStats[category] = (categoryStats[category] || 0) + 1;
});

print('\n按类别统计:');
Object.entries(categoryStats).forEach(([category, count]) => {
  print(`  ${category}: ${count} 条记录`);
});

print('\n模拟数据生成完成！');
