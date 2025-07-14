// 设备相关 Vuex 模块

const state = {
  // 以 id 为 key 的设备信息 Map
  deviceMap: {},
}

const getters = {
  getDeviceById: (state) => (id) => state.deviceMap[id] || null,
}

const mutations = {
  // 批量设置列表
  SET_DEVICE_LIST(state, list) {
    list.forEach((d) => {
      state.deviceMap[d._id] = d
    })
  },
  // 单个设置
  SET_DEVICE(state, device) {
    state.deviceMap[device._id] = device
  },
}

const actions = {
  setDeviceList({ commit }, list) {
    commit('SET_DEVICE_LIST', list)
  },
  setDevice({ commit }, device) {
    commit('SET_DEVICE', device)
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
