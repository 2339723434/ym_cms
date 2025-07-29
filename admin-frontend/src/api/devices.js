import axios from 'axios'
import app from '@/cloud'

/**
 * 获取设备列表
 * @param {Number|Object} page 当前页码或参数对象
 * @param {Number} limit 每页条数，默认30
 * @param {String} searchQuery 搜索关键词
 * @param {String} name 精确设备名
 * @param {String} mac_address 精确MAC
 */
export function getDeviceList(page = 1, limit = 30, searchQuery = '', name = '', mac_address = '') {
  // 兼容对象参数调用
  let params = {}
  if (typeof page === 'object') {
    params = { ...page }
    params.page = params.page || 1
    params.limit = params.limit || 30
  } else {
    params = { page, limit, searchQuery, name, mac_address }
  }
  return app
    .callFunction({
      name: 'getDeviceList',
      data: params,
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        return Promise.reject(new Error(result?.message || '获取设备列表失败'))
      }
      // result.data: { list, total }
      return {
        data: {
          list: result.data.list || [],
          total: result.data.total || 0,
        },
      }
    })
}

/**
 * 获取设备详情
 * @param {String} id 设备ID
 */
export function getDeviceDetail(id) {
  return app
    .callFunction({
      name: 'getDeviceDetail',
      data: { deviceId: id },
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        return Promise.reject(new Error(result?.message || '获取设备详情失败'))
      }
      return { data: result.data }
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

export function getAllDeviceData(page = 1, limit = 20, mac_address = '', date = '') {
  return app
    .callFunction({
      name: 'getAllDeviceData',
      data: { page, limit, mac_address, date },
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        console.error('getAllDeviceData error:', result?.error)
        return Promise.reject(new Error(result?.error || '获取失败'))
      }
      return { data: result.data || [], total: result.total || 0 }
    })
    .catch((err) => {
      console.error('Cloud function call failed:', err)
      return Promise.reject(err)
    })
}

/**
 * 导入设备数据
 * @param {Array} devices 设备数据数组
 * 预期格式： [{ regionId, agentName, contact, deviceName, macAddress }]
 */
export function importDevices(devices) {
  return app
    .callFunction({
      name: 'importDevices',
      data: { devices },
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        console.error('importDevices error:', result?.error)
        return Promise.reject(new Error(result?.error || '导入设备失败'))
      }
      return result
    })
    .catch((err) => {
      console.error('Import devices cloud function call failed:', err)
      return Promise.reject(err)
    })
}

/**
 * 导入代理数据
 * @param {Array} agents 代理数据数组
 * 预期格式： [{ regionId, agentName, contact }]
 */
export function importAgent(agents) {
  return app
    .callFunction({
      name: 'importAgent',
      data: { agents },
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        console.error('importAgent error:', result?.error)
        return Promise.reject(new Error(result?.error || '导入代理失败'))
      }
      return result
    })
    .catch((err) => {
      console.error('Import agent cloud function call failed:', err)
      return Promise.reject(err)
    })
}
