// MongoDB Playground 脚本 - 删除demo用户数据
// 在 MongoDB Playground 中直接运行

// 设置目标用户ID
const TARGET_USER_ID = "6836ff9a7f5f9b2d0e326bc9"; // demo用户的userId

// 切换到正确的数据库
use("fit-note");

print("=== 删除demo用户数据 ===");
print(`目标用户ID: ${TARGET_USER_ID}`);

// 先统计要删除的数据量
const projectCount = db.projects.countDocuments({ userId: TARGET_USER_ID });
const workoutCount = db.workouts.countDocuments({ userId: TARGET_USER_ID });

print(`\n统计信息:`);
print(`  - 项目数量: ${projectCount}`);
print(`  - 训练记录数量: ${workoutCount}`);

if (projectCount === 0 && workoutCount === 0) {
  print("\n没有找到demo用户的数据，无需删除");
} else {
  // 删除训练记录
  if (workoutCount > 0) {
    print("\n正在删除训练记录...");
    const workoutResult = db.workouts.deleteMany({ userId: TARGET_USER_ID });
    print(`  - 已删除 ${workoutResult.deletedCount} 条训练记录`);
  }

  // 删除项目
  if (projectCount > 0) {
    print("\n正在删除项目...");
    const projectResult = db.projects.deleteMany({ userId: TARGET_USER_ID });
    print(`  - 已删除 ${projectResult.deletedCount} 个项目`);
  }

  // 验证删除结果
  print("\n=== 删除完成 ===");
  const remainingProjects = db.projects.countDocuments({ userId: TARGET_USER_ID });
  const remainingWorkouts = db.workouts.countDocuments({ userId: TARGET_USER_ID });

  print(`验证结果:`);
  print(`  - 剩余项目: ${remainingProjects}`);
  print(`  - 剩余训练记录: ${remainingWorkouts}`);

  if (remainingProjects === 0 && remainingWorkouts === 0) {
    print("\n✅ demo用户的所有数据已成功删除！");
  } else {
    print("\n⚠️  仍有数据未删除，请检查");
  }
}

print("\n删除操作完成！");
