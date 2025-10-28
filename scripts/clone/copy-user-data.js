// 参数
const SOURCE_USER = 'cjq';
const TARGET_USER = 'demo';

// 使用当前数据库（容器命令里已指定 / 或外部连接已指定）
const projectsCol = db.getCollection('projects');
const workoutsCol = db.getCollection('workouts');

// 读取源用户的所有项目
const sourceProjects = projectsCol.find({ userId: SOURCE_USER }).toArray();

// 建立 oldProjectId -> newProjectId 的映射，若目标已存在同名项目则复用
const projectIdMap = new Map();

for (const p of sourceProjects) {
  const existing = projectsCol.findOne({ userId: TARGET_USER, name: p.name });

  if (existing) {
    projectIdMap.set(p._id.valueOf(), existing._id);
    continue;
  }

  const docToInsert = {
    // 注意：不要复制 _id / id，Mongo 会生成新的 _id
    name: p.name,
    description: p.description,
    userId: TARGET_USER,
    seqNo: typeof p.seqNo === 'number' ? p.seqNo : 0,
    category: p.category,
    defaultUnit: p.defaultUnit,
    defaultWeight: p.defaultWeight,
    equipments: Array.isArray(p.equipments) ? p.equipments : [],
    createdAt: p.createdAt || new Date(),
    updatedAt: new Date(),
  };

  const res = projectsCol.insertOne(docToInsert);
  projectIdMap.set(p._id.valueOf(), res.insertedId);
}

// 读取源用户的所有训练
const sourceWorkouts = workoutsCol.find({ userId: SOURCE_USER }).toArray();

const workoutsToInsert = [];

for (const w of sourceWorkouts) {
  // 计算目标 projectId：优先映射，其次尝试按名称回退匹配
  let mappedProjectId = projectIdMap.get((w.projectId || '').valueOf?.() || String(w.projectId));

  if (!mappedProjectId && w.projectName) {
    const fallback = projectsCol.findOne({ userId: TARGET_USER, name: w.projectName });
    if (fallback) mappedProjectId = fallback._id;
  }

  if (!mappedProjectId) {
    // 如果找不到对应项目，跳过该训练条目以避免脏数据
    continue;
  }

  const docToInsert = {
    userId: TARGET_USER,
    date: w.date,
    projectId: mappedProjectId,
    projectName: w.projectName,
    unit: w.unit,
    groups: Array.isArray(w.groups) ? w.groups : [],
    trainingTime: typeof w.trainingTime === 'number' ? w.trainingTime : 0,
    remark: w.remark,
    createdAt: w.createdAt || new Date(),
    updatedAt: new Date(),
  };

  workoutsToInsert.push(docToInsert);
}

if (workoutsToInsert.length > 0) {
  workoutsCol.insertMany(workoutsToInsert);
}

print(`Projects copied/mapped: ${projectIdMap.size}`);
print(`Workouts inserted: ${workoutsToInsert.length}`);