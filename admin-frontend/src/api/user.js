import axios from 'axios'
import app from '@/cloud'

export function getUserList(page = 1, limit = 20) {
  return axios({
    method: 'post',
    url: '/users/list',
    data: { page, limit },
  })
}

export function createUser(data) {
  return axios({
    method: 'post',
    url: '/users/create',
    data,
  })
}

export function registerUser(userData) {
  return app
    .callFunction({
      name: 'registerUser',
      data: userData,
    })
    .then((res) => {
      const { result } = res || {}
      if (!result || result.code !== 0) {
        return Promise.reject(new Error(result?.message || '注册失败'))
      }
      return result
    })
}
