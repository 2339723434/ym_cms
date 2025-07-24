import axios from 'axios'

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
