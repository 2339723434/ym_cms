const tcb = require("@cloudbase/node-sdk");

// 初始化云开发
const app = tcb.init({
  env: 'cloud1-9g096vw3e0246f49',
});

exports.main = async (event, context) => {

  const db = app.database();

  try {
    // 1. 统计device_records 表里的记录数，用聚合统计
    console.log('开始统计 device_records 表...');
    
    const statsResult = await db.collection('device_records')
      .aggregate()
      .group({
        _id: '$device_id', // 按 device_id 分组
        total_records: db.command.aggregate.sum(1) // 每找到一条记录，就加 1
      })
      .end();

    const statsList = statsResult.data;
    console.log('统计完成, 结果:', statsList);

    // 2. 批量更新 devices 表
    console.log('开始批量更新 devices 表...');

    // 创建一个任务数组，用来一次性存放所有的更新操作，map是数组到数组的函数
    const updateTasks = statsList.map(item => {
      return db.collection('devices').where({
        // 找到要更新的设备
        _id: item._id
      }).update({
        // 更新总使用次数
        total_records: item.total_records
      });
    });

    await Promise.all(updateTasks); // 等待任务清单全部完成
    console.log('批量更新完成！');

    // 3. 查询最新的 devices 表数据，返回给前端
    console.log('查询最新的设备列表...');
    const deviceListResult = await db.collection('devices').get();

    return {
      success: true,
      data: deviceListResult.data
    };

  } catch (e) {
    // 如果任何一步出错，就在日志里打印错误，并告诉前端失败了
    console.error('执行失败:', e);
    return {
      success: false,
      error: e.toString()
    };
  }
};