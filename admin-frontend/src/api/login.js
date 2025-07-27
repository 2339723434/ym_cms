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
            { address: '/custom-component', type: 1, name: '自定义组件' },
            { address: '/echarts/index', type: 1, name: '数量统计' },
            { address: '/draggable', type: 1, name: '拖拽' },
            { address: '/excel/dynamic-table', type: 1, name: '动态表格' },
            { address: '/excel/export-excel', type: 1, name: '导出表格' },
            { address: '/excel/upload-excel', type: 1, name: '上传表格' },
            { address: '/excel/merge-count', type: 1, name: '合并&统计' },
            { address: '/excel/custom-design', type: 1, name: '自定义设计' },
            { address: '/clipboard', type: 1, name: '剪切板' },
            { address: '/futures/draggable', type: 1, name: '拖拽' },
            { address: '/futures/clipboard', type: 1, name: '剪切板' },
            { address: '/introduction/index', type: 1, name: '简述' },
            { address: '/nested/menu1', type: 1, name: '路由嵌套' },
            { address: '/nested/menu2', type: 1, name: '路由嵌套' },
            { address: '/nested/menu3', type: 1, name: '路由嵌套' },
            { address: '/nested/menu4', type: 1, name: '路由嵌套' },
            { address: '/nested/menu5', type: 1, name: '路由嵌套' },
            { address: '/nested/menu6', type: 1, name: '路由嵌套' },
            { address: '/nested/menu7', type: 1, name: '路由嵌套' },
            { address: '/theme/index', type: 1, name: '主题' },
            { address: '/user/index', type: 1, name: '用户' },
            { address: '/user/info', type: 1, name: '用户信息' },
            { address: '/user/profile', type: 1, name: '个人中心' },
            { address: '/user', type: 1, name: '用户' },
            { address: '/devices/index', type: 1, name: '设备' },
            { address: '/devices/detail', type: 1, name: '设备详情' },
            { address: '/devices/all-data', type: 1, name: '设备数据' },
            { address: '/users/manage', type: 1, name: '用户管理' },
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
