// 文件路径: /my_data_platform/cloudfunctions/hello/index.js

exports.main = async (event, context) => {
    console.log('Hello云函数被调用了');

    // 返回一个JSON对象给前端
    return {
        // 新增 headers 部分，解决跨域问题
        headers: {
            'Access-Control-Allow-Origin': '*' // 允许所有来源的跨域请求
        },
        code: 200,
        message: "你好，这里是云函数后端！",
        data: { 
            text: "这是一个成功的后端响应",
            timestamp: new Date() 
        }
    };
};