import axios from 'axios'
import app from '@/cloud'

/**
 * 获取代理列表
 * @param {Number} page 当前页码 (从1开始)
 * @param {Number} limit 每页条数，默认20
 * @param {Object} searchParams 搜索参数
 * @param {string} searchParams.account 代理账号
 * @param {string} searchParams.name 代理姓名
 * @param {string} searchParams.region 代理区域
 */
export function getAgentList(page = 1, limit = 20, searchParams = {}) {
  return app
    .callFunction({
      name: 'getAgentList',
      data: {
        page,
        limit,
        account: searchParams.account,
        name: searchParams.name,
        region: searchParams.region,
      },
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        return Promise.reject(new Error(result?.message || '获取代理列表失败'))
      }

      return {
        data: result.data,
      }
    })
}

/**
 * 获取代理详情
 * @param {String} id 代理ID
 */
export function getAgentDetail(id) {
  return app
    .callFunction({
      name: 'getAgentDetail',
      data: { agentId: id },
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        return Promise.reject(new Error(result?.message || '获取代理详情失败'))
      }
      return { data: result.data }
    })
}

/**
 * 获取代理管理的设备列表
 * @param {String} agentId 代理ID
 */
export function getAgentDevices(agentId) {
  return app
    .callFunction({
      name: 'getAgentDevices',
      data: { agentId },
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        return Promise.reject(new Error(result?.message || '获取代理设备失败'))
      }
      return { data: result.data }
    })
}

/**
 * 获取可分配的设备列表
 */
export function getAvailableDevices() {
  return app
    .callFunction({
      name: 'getAvailableDevices',
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        return Promise.reject(new Error(result?.message || '获取可分配设备失败'))
      }
      return { data: result.data }
    })
}

/**
 * 创建代理账户
 * @param {Object} agentData 代理数据
 */
export function createAgentAcc(agentData) {
  return app
    .callFunction({
      name: 'creatAgentAcc',
      data: agentData,
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        return Promise.reject(new Error(result?.message || '创建代理失败'))
      }
      return { data: result.data }
    })
}

/**
 * 注册新代理
 * @param {Object} agentData 代理数据
 */
export function registerAgent(agentData) {
  return app
    .callFunction({
      name: 'registerAgent',
      data: agentData,
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        return Promise.reject(new Error(result?.message || '创建代理失败'))
      }
      return { data: result.data }
    })
}

/**
 * 分配设备给代理
 * @param {String} agentId 代理ID
 * @param {Array} deviceIds 设备ID数组
 */
export function assignDevicesToAgent(agentId, deviceIds) {
  return app
    .callFunction({
      name: 'assignDevicesToAgent',
      data: { agentId, deviceIds },
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        return Promise.reject(new Error(result?.message || '分配设备失败'))
      }
      return { data: result.data }
    })
}

/**
 * 从代理移除设备
 * @param {String} agentId 代理ID
 * @param {String} deviceId 设备ID
 */
export function removeDeviceFromAgent(agentId, deviceId) {
  return app
    .callFunction({
      name: 'removeDeviceFromAgent',
      data: { agentId, deviceId },
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        return Promise.reject(new Error(result?.message || '移除设备失败'))
      }
      return { data: result.data }
    })
}

/**
 * 更新代理信息
 * @param {String} agentId 代理ID
 * @param {Object} agentData 更新的代理数据
 */
export function updateAgent(agentId, agentData) {
  return app
    .callFunction({
      name: 'updateAgent',
      data: { agentId, ...agentData },
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        return Promise.reject(new Error(result?.message || '更新代理失败'))
      }
      return { data: result.data }
    })
}

/**
 * 删除代理
 * @param {String} agentId 代理ID
 */
export function deleteAgent(agentId) {
  return app
    .callFunction({
      name: 'deleteAgent',
      data: { agentId },
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        return Promise.reject(new Error(result?.message || '删除代理失败'))
      }
      return { data: result.data }
    })
}
