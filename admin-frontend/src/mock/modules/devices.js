import Mock from 'mockjs'

const total = 87 // total devices for demonstration
const devices = []
const randomMac = () => Array.from({ length: 6 }, () => Mock.Random.string('0123456789ABCDEF', 2)).join(':')
for (let i = 0; i < total; i++) {
  devices.push(
    Mock.mock({
      _id: `dev_${Mock.Random.string('hex', 8)}`,
      created_at: Mock.Random.datetime(),
      last_record_date: '',
      last_updated: Mock.Random.datetime(),
      latitude: Mock.Random.float(-90, 90, 6, 6),
      longitude: Mock.Random.float(-180, 180, 6, 6),
      mac_address: randomMac(),
      name: `AC-Master-${Mock.Random.string('number', 4)}`,
      total_records: Mock.Random.integer(0, 1000),
    }),
  )
}

function paginate(list, page = 1, limit = 30) {
  const start = (page - 1) * limit
  const end = page * limit
  return list.slice(start, end)
}

export default {
  getDeviceList: {
    state: true,
    url: '/devices/list',
    method: 'post',
    result: (req) => {
      const { page = 1, limit = 30 } = JSON.parse(req.body || '{}')
      return {
        list: paginate(devices, Number(page), Number(limit)),
        total: devices.length,
      }
    },
  },
  getDeviceDetail: {
    state: true,
    url: '/devices/detail',
    method: 'post',
    result: (req) => {
      const { id } = JSON.parse(req.body || '{}')
      const item = devices.find((d) => d._id === id)
      return item || {}
    },
  },
}
