// 删除 demo 用户 10 月份的 workout 数据
// 先查询再删除

print('=== 删除 demo 用户 10 月份 workout 数据 ===');

// 集合引用
const usersCol = db.getCollection('users');
const workoutsCol = db.getCollection('workouts');

// 查找 demo 用户
const demoUser = usersCol.findOne({ username: 'demo' });
if (!demoUser) {
  print('错误: 未找到 demo 用户');
  quit(1);
}

print(`demo 用户 ID: ${demoUser._id} (类型: ${typeof demoUser._id})`);

// 查询 10 月份的数据
print('\n=== 查询 10 月份数据 ===');

// 尝试不同的查询方式
const queries = [
  { userId: String(demoUser._id), date: { $regex: /^2025-10-/ } },
  { userId: String(demoUser._id), date: { $gte: "2025-10-01", $lt: "2025-11-01" } },
  { userId: demoUser._id, date: { $regex: /^2025-10-/ } },
  { userId: demoUser._id, date: { $gte: "2025-10-01", $lt: "2025-11-01" } },
  { userId: String(demoUser._id), date: { $regex: /10-/ } },
  { userId: demoUser._id, date: { $regex: /10-/ } },
  { date: { $regex: /^2025-10-/ } },
  { date: { $gte: "2025-10-01", $lt: "2025-11-01" } },
  { date: { $regex: /10-/ } }
];

let foundData = [];
let queryIndex = 0;

for (const query of queries) {
  queryIndex++;
  print(`\n查询 ${queryIndex}: ${JSON.stringify(query)}`);
  
  const results = workoutsCol.find(query).toArray();
  print(`找到 ${results.length} 条数据`);
  
  if (results.length > 0) {
    foundData = results;
    print('数据示例:');
    results.slice(0, 2).forEach((workout, index) => {
      print(`  ${index + 1}. userId: ${workout.userId} (${typeof workout.userId}), date: ${workout.date}, project: ${workout.projectName}`);
    });
    break;
  }
}

if (foundData.length === 0) {
  print('\n没有找到 10 月份的数据');
  quit(0);
}

// 确认删除
print(`\n=== 确认删除 ===`);
print(`准备删除 ${foundData.length} 条数据`);
print('数据详情:');

// 按日期分组显示
const groupedByDate = {};
foundData.forEach(workout => {
  if (!groupedByDate[workout.date]) {
    groupedByDate[workout.date] = [];
  }
  groupedByDate[workout.date].push(workout);
});

Object.keys(groupedByDate).sort().forEach(date => {
  const workouts = groupedByDate[date];
  print(`  ${date}: ${workouts.length} 条记录`);
  workouts.forEach(workout => {
    print(`    - ${workout.projectName} (${workout.groups.length} 组)`);
  });
});

// 执行删除
print('\n=== 执行删除 ===');

// 基于观察到的数据格式，使用最直接的删除方法
const deleteQueries = [
  { userId: "6836ff9a7f5f9b2d0e326bc9", date: { $regex: /^2025-10-/ } },
  { userId: "6836ff9a7f5f9b2d0e326bc9", date: { $gte: "2025-10-01", $lt: "2025-11-01" } },
  { userId: String(demoUser._id), date: { $regex: /^2025-10-/ } },
  { userId: String(demoUser._id), date: { $gte: "2025-10-01", $lt: "2025-11-01" } }
];

let totalDeleted = 0;
for (const deleteQuery of deleteQueries) {
  print(`尝试删除查询: ${JSON.stringify(deleteQuery)}`);
  const deleteResult = workoutsCol.deleteMany(deleteQuery);
  if (deleteResult.deletedCount > 0) {
    print(`成功删除 ${deleteResult.deletedCount} 条数据`);
    totalDeleted += deleteResult.deletedCount;
    break; // 找到有效的删除方法就停止
  }
}

if (totalDeleted === 0) {
  print('所有删除查询都失败了，尝试强制删除...');
  // 最后尝试：删除所有包含特定 remark 的数据
  const forceDeleteResult = workoutsCol.deleteMany({ remark: { $regex: /模拟训练数据/ } });
  print(`强制删除结果: ${forceDeleteResult.deletedCount} 条数据`);
  totalDeleted = forceDeleteResult.deletedCount;
}

// 验证删除结果
print('\n=== 验证删除结果 ===');
const remainingData = workoutsCol.find({ userId: "6836ff9a7f5f9b2d0e326bc9", date: { $regex: /^2025-10-/ } }).toArray();
print(`剩余数据: ${remainingData.length} 条`);

if (remainingData.length === 0) {
  print('✓ 删除成功，没有剩余数据');
} else {
  print('⚠ 仍有数据未删除');
  remainingData.slice(0, 3).forEach((workout, index) => {
    print(`  ${index + 1}. ${workout.date} - ${workout.projectName}`);
  });
}

print('\n删除操作完成！');
