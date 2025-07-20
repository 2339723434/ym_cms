import axios from 'axios'
import app from '@/cloud'

/**
 * 获取设备列表
 * @param {Number} page 当前页码 (从1开始)
 * @param {Number} limit 每页条数，默认30
 */
export function getDeviceList(page = 1, limit = 30) {
  return axios({
    method: 'post',
    url: '/devices/list',
    data: {
      page,
      limit,
    },
  })
  return app
    .callFunction({
      name: 'getDeviceList',
    })
    .then((res) => {
      // 云函数返回格式： { code, message, data: [...] }
      const { result } = res || {}
      if (!result || result.code !== 0) {
        return Promise.reject(new Error(result?.message || '获取设备列表失败'))
      }

      const allList = result.data || []
      // 前端再次分页（云函数当前返回全部数据）
      const start = (page - 1) * limit
      const list = allList.slice(start, start + limit)

      return {
        data: {
          list,
          total: allList.length,
        },
      }
    })
}

/**
 * 获取设备详情
 * @param {String} id 设备ID
 */
export function getDeviceDetail(id) {
  return axios({
    method: 'post',
    url: '/devices/detail',
    data: {
      id,
    },
  })
}
