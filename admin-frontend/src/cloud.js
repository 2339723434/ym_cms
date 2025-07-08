import Tcb from 'tcb-js-sdk'

const app = Tcb.init({
  env: 'cloud1-9g096vw3e0246f49', // 替换为你的环境ID
})

// 初始化 Auth，创建请求实例，以免 callFunction 时 request 未就绪
app.auth()

export default app
