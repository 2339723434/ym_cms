<template>
  <div id="app">
    <h1>前端界面</h1>
    <button @click="callHelloFunction" :disabled="isLoading">
      {{ isLoading ? '正在调用...' : '调用云函数' }}
    </button>
    <p>来自后端的消息: <strong>{{ backendMessage }}</strong></p>
    <p v-if="errorText" style="color: red;">错误信息: {{ errorText }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const isLoading = ref(false);
const backendMessage = ref('等待调用...');
const errorText = ref('');

async function callHelloFunction() {
  try {
    isLoading.value = true;
    backendMessage.value = '正在调用...';
    errorText.value = ''; // 清空之前的错误信息

    // !!! 这是最关键的一步 !!!
    // !!! 请将下面的URL字符串，替换成您刚刚复制的真实URL !!!
    const url = 'https://cloud1-9g096vw3e0246f49-1302000556.ap-shanghai.app.tcloudbase.com/hello';

    const response = await axios.get(url);

    if (response.data && response.data.message) {
        backendMessage.value = response.data.message + ' ' + response.data.data.text;
    } else {
        backendMessage.value = '收到了一个意外的响应格式';
    }

  } catch (error) {
    console.error('调用云函数失败:', error);
    backendMessage.value = '调用失败';
    errorText.value = error.message; // 显示错误信息
  } finally {
    isLoading.value = false;
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
button {
  padding: 10px 20px;
  font-size: 16px;
  margin-bottom: 20px;
  cursor: pointer;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>