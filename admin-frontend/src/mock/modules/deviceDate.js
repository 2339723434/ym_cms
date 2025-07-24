import Mock from 'mockjs'

function generateDateData() {
  const list = []
  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(today.getTime() - i * 86400000)
    list.unshift(
      Mock.mock({
        date: d.toISOString().slice(0, 10),
        pause: '@integer(0,10)',
        shallow: '@integer(60,120)',
        snore: '@integer(0,20)',
        hypopnea: '@integer(0,10)',
        tiny: '@integer(30,90)',
      }),
    )
  }
  return list
}

export default {
  getDeviceDateData: {
    state: true,
    url: '/devices/dateData',
    method: 'post',
    result: (req) => {
      return generateDateData()
    },
  },
}
