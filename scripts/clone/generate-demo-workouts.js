// 生成 demo 用户模拟 workout 数据
// 使用方法：
// 在脚本开头定义 YEAR 和 MONTH 变量
// 例如：const YEAR = 2024; const MONTH = 12;
const TARGET_USERNAME = 'demo';

// 检查必需参数
if (typeof YEAR === 'undefined' || typeof MONTH === 'undefined') {
  print('错误: 必须定义 YEAR 和 MONTH 参数');
  print('使用方法:');
  print('  const YEAR = 2025;');
  print('  const MONTH = 10;');
  print('  load("generate-demo-workouts.js");');
  quit(1);
}

// 验证参数有效性
if (YEAR < 2000 || YEAR > 2100) {
  print(`错误: 年份 ${YEAR} 超出有效范围 (2000-2100)`);
  quit(1);
}

if (MONTH < 1 || MONTH > 12) {
  print(`错误: 月份 ${MONTH} 超出有效范围 (1-12)`);
  quit(1);
}

const year = YEAR;
const month = MONTH;

// 调试信息
print(`调试: 接收到的参数 - YEAR: ${year}, MONTH: ${month}`);

// 集合引用
const usersCol = db.getCollection('users');
const projectsCol = db.getCollection('projects');
const workoutsCol = db.getCollection('workouts');

print(`=== 生成 demo 用户 ${year}年${month}月模拟 workout 数据 ===`);

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

// 生成指定年月的训练数据
// 动态计算指定月份的天数
const daysInMonth = new Date(year, month, 0).getDate();
print(`${year}年${month}月有 ${daysInMonth} 天`);

// 获取今天的日期
const today = new Date();
const todayDate = today.getDate();

// 确保不生成大于今天的数据
const maxDay = Math.min(daysInMonth, todayDate);

print(`生成 ${month}月1日 到 ${month}月${maxDay}日 的训练数据`);

// 生成训练日期：更随机的训练安排
const trainingDays = [];
const totalDays = maxDay;
const targetTrainingDays = Math.floor(totalDays * 0.57); // 约57%的天数训练

// 使用更复杂的随机算法生成训练日期
const allDays = Array.from({length: totalDays}, (_, i) => i + 1);
const selectedDays = new Set();

// 确保不会连续训练太多天（最多连续3天）
let consecutiveDays = 0;
const maxConsecutive = 3;

while (selectedDays.size < targetTrainingDays) {
  const randomIndex = Math.floor(Math.random() * allDays.length);
  const day = allDays[randomIndex];
  
  if (!selectedDays.has(day)) {
    // 检查是否会造成连续训练过多
    const prevDay = day - 1;
    const nextDay = day + 1;
    const hasPrev = selectedDays.has(prevDay);
    const hasNext = selectedDays.has(nextDay);
    
    if (hasPrev && hasNext) {
      // 如果前后都有训练，跳过这一天
      continue;
    }
    
    selectedDays.add(day);
    consecutiveDays = hasPrev ? consecutiveDays + 1 : 1;
    
    if (consecutiveDays > maxConsecutive) {
      // 如果连续训练太多天，移除最后一天
      const lastDay = Array.from(selectedDays).pop();
      selectedDays.delete(lastDay);
      consecutiveDays--;
    }
  }
}

trainingDays.push(...Array.from(selectedDays).sort((a, b) => a - b));

print(`训练天数: ${trainingDays.length} 天`);
print(`训练日期: ${trainingDays.join(', ')}`);

// 生成训练记录
const workoutsToInsert = [];
let totalWorkouts = 0;

trainingDays.forEach(day => {
  const trainingDate = new Date(year, month - 1, day);
  const dateString = trainingDate.toISOString().split('T')[0]; // 格式化为 YYYY-MM-DD
  
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
  
  print(`${month}月${day}日: ${selectedProjects.length} 个项目 (${selectedProjects.map(p => p.name).join(', ')})`);
  
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
      
      // 生成休息时间 (30-60秒)
      const restSeed = (repsSeed + g * 13) * 9301 + 49297;
      const restRandom = (restSeed % 233280) / 233280;
      const restTime = Math.floor(restRandom * 31) + 30; // 30-60秒
      
      groups.push({
        reps: reps,
        weight: weight,
        seqNo: g + 1,
        restTime: g === groupCount - 1 ? 0 : restTime, // 最后一组休息时间为0
        _id: new ObjectId()
      });
    }
    
    // 生成训练时间 (15-120分钟) - 每个项目都有不同的时间
    const projectIndex = selectedProjects.indexOf(project);
    const timeSeed = (day * 31 + project._id.toString().charCodeAt(1) + projectIndex * 17 + Math.floor(Math.random() * 1000)) * 9301 + 49297;
    const timeRandom = (timeSeed % 233280) / 233280;
    
    // 根据项目类型调整时间范围
    const category = project.category || '未分类';
    let minTime = 15;
    let maxTime = 120;
    
    if (category === 'Cardio') {
      minTime = 20;
      maxTime = 60;
    } else if (category === 'Abs' || category === 'Core') {
      minTime = 15;
      maxTime = 45;
    } else if (category === 'Arms' || category === 'Shoulders') {
      minTime = 20;
      maxTime = 60;
    } else if (category === 'Chest' || category === 'Back' || category === 'Legs') {
      minTime = 30;
      maxTime = 90;
    }
    
    const trainingTime = Math.floor(timeRandom * (maxTime - minTime)) + minTime;
    
    const workout = {
      userId: targetUserId,
      date: dateString,
      projectId: project._id.toString(),
      projectName: project.name,
      unit: project.defaultUnit || 'kg',
      groups: groups,
      trainingTime: trainingTime,
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
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
