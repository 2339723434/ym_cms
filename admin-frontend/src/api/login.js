import request from '@/utils/request'
import app from '@/cloud'

export function login(userInfo) {
  // 使用云函数 checkLogin 进行账号校验
  return app
    .callFunction({
      name: 'checkLogin',
      data: {
        username: userInfo.username,
        password: userInfo.pwd,
      },
    })
    .then((res) => {
      const { success, userInfos } = res.result || {}
      if (!success) {
        return Promise.reject(new Error('登录失败'))
      }

      // 构造符合原后端接口的数据结构
      const mockToken = Math.random().toString(36).substr(2)
      return {
        data: {
          token: mockToken, // 云函数暂未返回，使用用户 id 作为 token
          permissions: [
            { address: '/home', type: 1, name: '首页' },
            { address: '/excel/export-excel', type: 1, name: '导出表格' },
          ], // 权限列表后端暂未返回，可按需补充
          userInfo: userInfos,
        },
      }
    })
}

export function logout() {
  return request({
    url: '/login/logout',
    method: 'post',
  })
}

export function userInfo() {
  return request({
    url: '/user/getInfo',
    method: 'get',
  })
}
