<template>
    <div class="device-detail" v-loading="loading">
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>设备详情</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="$router.back()">返回</el-button>
            </div>
            <el-descriptions :column="2" border>
                <el-descriptions-item label="ID">{{ data._id }}</el-descriptions-item>
                <el-descriptions-item label="名称">{{ data.name }}</el-descriptions-item>
                <el-descriptions-item label="MAC 地址">{{ data.mac_address }}</el-descriptions-item>
                <el-descriptions-item label="经纬度">{{ data.latitude }}, {{ data.longitude }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ formatDate(data.created_at) }}</el-descriptions-item>
                <el-descriptions-item label="最后更新">{{ formatDate(data.last_updated) }}</el-descriptions-item>
                <el-descriptions-item label="最后记录日期">{{ formatDate(data.last_record_date) }}</el-descriptions-item>
                <el-descriptions-item label="总记录数">{{ data.total_records }}</el-descriptions-item>
            </el-descriptions>
        </el-card>
    </div>
</template>

<script>
import { getDeviceDetail } from '@/api/devices'
export default {
    name: 'DeviceDetail',
    data() {
        return {
            data: {},
            loading: false,
        }
    },
    methods: {
        formatDate(val) {
            if (!val) return '--'
            const date = new Date(val)
            return date.toLocaleString()
        },
        async fetchDetail(id) {
            this.loading = true
            try {
                const resp = await getDeviceDetail(id)
                this.data = resp.data || {}
            } catch (e) {
                console.error(e)
            } finally {
                this.loading = false
            }
        },
        /**
         * 根据路由更新详情数据
         */
        async updateDetail(route) {
            // 若 query 中已包含完整数据，直接使用
            if (route.query && route.query.data) {
                this.data = JSON.parse(route.query.data)
            } else if (route.query && route.query.id) {
                await this.fetchDetail(route.query.id)
            }
        },
    },
    /**
     * 当路由 query 改变（点击列表其他设备，路径相同但参数不同）时，组件实例会复用，
     * created 钩子不会再次触发，需要在 beforeRouteUpdate 中手动处理。
     */
    beforeRouteUpdate(to, from, next) {
        this.updateDetail(to)
        next()
    },
    created() {
        this.updateDetail(this.$route)
    },
}
</script>

<style scoped>
.device-detail {
    padding: 20px;
}
</style>