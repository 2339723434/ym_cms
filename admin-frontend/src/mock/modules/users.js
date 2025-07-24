import Mock from 'mockjs'

const roles = ['admin', 'editor', 'viewer']
const regions = ['华东', '华南', '华北', '西南', '海外']
const users = []
for (let i = 0; i < 50; i++) {
  users.push(
    Mock.mock({
      _id: Mock.Random.guid(),
      account: Mock.Random.word(5, 10),
      password: Mock.Random.string(8, 12),
      role: Mock.Random.pick(roles),
      region: Mock.Random.pick(regions),
      last_login_at: Mock.Random.datetime(),
    }),
  )
}

function paginate(list, page = 1, limit = 20) {
  const start = (page - 1) * limit
  return list.slice(start, start + limit)
}

export default {
  getUserList: {
    state: true,
    url: '/users/list',
    method: 'post',
    result: (req) => {
      const { page = 1, limit = 20 } = JSON.parse(req.body || '{}')
      return { list: paginate(users, Number(page), Number(limit)), total: users.length }
    },
  },
  createUser: {
    state: true,
    url: '/users/create',
    method: 'post',
    result: (req) => {
      const body = JSON.parse(req.body || '{}')
      const newUser = {
        _id: Mock.Random.guid(),
        account: body.account || Mock.Random.word(5, 10),
        password: body.password || Mock.Random.string(8, 12),
        role: body.role || 'viewer',
        region: body.region || '华东',
        last_login_at: '',
      }
      users.unshift(newUser)
      return { code: 0, message: 'success' }
    },
  },
}
