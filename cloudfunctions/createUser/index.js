const cloud = require('@cloudbase/node-sdk');
const bcrypt = require('bcryptjs');

// 初始化云开发
const app = tcb.init({
  env: 'cloud1-9g096vw3e0246f49',
});

exports.main = async (event, context) => {
    const db = app.database();
    const usersCollection = db.collection('users');

    // 解构赋值获取用户名和密码
    const { username, password } = event;

    // 检查用户名和密码
    if (!username || !password) {
        return {
        success: false,
        message: '用户名和密码不能为空',
        };
    }


    try {
        // 检查用户名是否重复
        const userCount = await usersCollection.where({username}).count();
        if (userCount.total > 0) {
            return {
                success: false,
                message: '该用户名已被注册',
            };  
        }

        // 对密码进行哈希处理
        const hashedPassword = await bcrypt.hash(password, 10);

        // 存入数据库
        await usersCollection.add({
            username: username,
            password: hashedPassword,
            createdAt: new Date(),
        });

        return {
            success: true,
            message: '用户创建成功',
        };

    } catch (error) {
        return {
            success: false,
            message: '创建用户时发生错误',
            error: error.message,
        };
    }
}