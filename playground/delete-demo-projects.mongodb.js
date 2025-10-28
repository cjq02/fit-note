// MongoDB Playground
use("fit-note");

// demo 用户的 userId（ObjectId 类型）
const TARGET_USER_ID = ObjectId("6836ff9a7f5f9b2d0e326bc9");

// 删除前统计
const before = db.projects.countDocuments({ userId: TARGET_USER_ID });
print(`即将删除 projects 中 userId=${TARGET_USER_ID} 的文档数量: ${before}`);

// 执行删除
const result = db.projects.deleteMany({ userId: TARGET_USER_ID });
print(`已删除: ${result.deletedCount} 条`);

// 验证
const after = db.projects.countDocuments({ userId: TARGET_USER_ID });
print(`删除后剩余: ${after}`);