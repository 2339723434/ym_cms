const tcb = require("@cloudbase/node-sdk");

// 初始化云开发
const app = tcb.init({
  env: 'cloud1-9g096vw3e0246f49',
});

exports.main = async (event, context) => {
    const db = app.database();

    // 传入设备id和日期
    const {deviceId, reportDate } = event;
    if (!deviceId || !reportDate) {
        return {
            success: false,
            error: '缺少必要参数：deviceId 和 reportDate'
        };
    }

    try {
        console.log(`开始查询: deviceId=${deviceId}, date=${reportDate}`);

        // 设置筛选条件
        const result = await db.collection('device_records').where({
            device_id: deviceId,
            date: reportDate
        }).get(); // 返回所有满足的记录

        // 返回查询结果
        if (result.data && result.data.length > 0){
            // 返回当天第一条
            console.log('查询成功:', result.data[0]);
            return {
                success: true,
                data: result.data[0]
            };
        }else {
            console.log('未找到匹配的睡眠记录');
            return {
            success: false,
            error: '未找到指定设备和日期的睡眠记录',
            data: null
            };
        }
    } catch (error) {
        console.error('查询执行失败:', e);
        return {
        success: false,
        error: e.toString()
        };
    }


}