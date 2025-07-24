import axios from 'axios'
import app from '@/cloud'

/**
 * 获取设备列表
 * @param {Number} page 当前页码 (从1开始)
 * @param {Number} limit 每页条数，默认30
 */
export function getDeviceList(page = 1, limit = 30) {
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

/**
 * 调用云函数 getUserUsage，同步设备使用次数并返回最新设备列表
 */
export function updateDeviceUsage() {
  return app.callFunction({ name: 'getUserUsage' })
}

/**
 * 获取设备按日期的各项统计数据
 * @param {String} id 设备ID
 * 预期后端返回格式： { data: [ { date:'YYYY-MM-DD', pause:0, shallow:0, snore:0, hypopnea:0, deep:0 } ] }
 */
// 调用云函数获取睡眠报告（日期统计）
export function getDeviceSleepReport(id) {
  return app.callFunction({
    name: 'getSleepReport',
    data: { deviceId: id },
  })
}
