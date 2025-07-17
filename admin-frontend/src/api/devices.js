import axios from 'axios'

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
