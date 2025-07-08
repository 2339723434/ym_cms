import Tcb from "tcb-js-sdk";

const app = Tcb.init({
  env: "cloud1-9g096vw3e0246f49",
});

// 1) 初始化 auth
const auth = app.auth({ persistence: "local" });

// 2) 若本地已有登录态可自动复用；否则走匿名登录
if (!auth.hasLoginState()) {
  // 匿名登录：后端需在【登录与权限】里勾选“允许未登录调用”
  auth.signInAnonymously().catch((e) => console.error("匿名登录失败", e));
}

export default app;
