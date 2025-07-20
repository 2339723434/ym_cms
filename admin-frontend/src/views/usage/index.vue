<template>
  <div class="app-container">
    <el-table :data="deviceList" :border="true" style="width: 100%">

      <el-table-column prop="_id" label="设备ID"></el-table-column>
      <el-table-column prop="total_records" label="使用次数"></el-table-column>

    </el-table>
  </div>
</template>

<script>
import app from '@/cloud'

export default {

  // data方法
  data() {
    return {
      // 定义一个空数组，用来存放从服务器获取的设备数据
      deviceList: []
    }
  },

  // `created` 方法，组件被创建时会自动执行
  created() {
    // 页面一加载，就调用下面的方法去获取数据
    this.fetchData();
  },

  // methods对象
  methods: {
    // 定义获取数据的方法
    fetchData() {
      // API请求，联系到云数据库
      app.callFunction({
        name: 'getUserUsage' // 指定云函数名字
      }).then(res => {
        // 当云函数成功返回数据时
        console.log('从云函数获取的数据:', res.result.data);

        // 把返回数据放入表格
        this.deviceList = res.result.data;

      }).catch(err => {
        // 如果调用失败，打印错误信息
        console.error('调用云函数失败:', err);
      })
    }
  }
}
</script>

<style scoped>
.app-container {
  padding: 20px;
}
</style>