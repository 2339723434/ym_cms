<template>
    <div class="devices-wrapper">
        <el-row class="content my_scrollbar" gutter="30">
            <el-col v-for="(device, index) in pagedDevices" :key="device._id" :xs="12" :sm="8" :md="6" :lg="4" :xl="4"
                class="device-card-wrapper">
                <div class="device-card" @click="goDetail(device)">
                    <div class="card-header">
                        <i class="el-icon-cpu"></i>
                    </div>
                    <div class="card-body">
                        <div class="device-name" :title="device.name">{{ device.name }}</div>
                        <div class="device-mac">{{ device.mac_address }}</div>
                        <div class="device-mac">{{ formatMac(device.mac_address) }}</div>
                        <div class="device-created">注册：{{ formatDate(device.created_at) }}</div>
                        <div class="device-updated">更新：{{ formatDate(device.last_updated) }}</div>
                        <div class="device-records">记录数：{{ device.total_records }}</div>
                    </div>
                </div>
            </el-col>
        </el-row>

        <div class="pagination-wrapper">
            <el-pagination background layout="prev, pager, next" :page-size="pageSize" :current-page.sync="currentPage"
                :total="total" @current-change="fetchDevices" />
        </div>
    </div>
</template>

<script>
import { getDeviceList } from '@/api/devices'
export default {
    name: 'Devices',
    data() {
        return {
            list: [],
            total: 0,
            currentPage: 1,
            pageSize: 30,
            loading: false,
        }
    },
    computed: {
        pagedDevices() {
            return this.list
        },
    },
    methods: {
        formatDate(val) {
            if (!val) return '--'
            const date = new Date(val)
            return date.toLocaleString()
        },
        goDetail(device) {
            this.$router.push({ path: '/devices/detail', query: { id: device._id, data: JSON.stringify(device) } })
            // 跳转时仅携带 id，设备数据写入 Vuex，详情页自行读取或请求
            this.$router.push({ path: '/devices/detail', query: { id: device._id } })
        },
        formatMac(mac) {
            if (!mac) return '--'
            // 移除非十六进制字符
            const hex = mac.replace(/[^a-fA-F0-9]/g, '')
            // 取后 12 位，不足左补 0
            const twelve = hex.slice(-12).padStart(12, '0')
            // 转为大写并按两位分组
            return twelve.toUpperCase().match(/.{2}/g).join(':')
        },
        async fetchDevices(page = 1) {
            this.loading = true
            try {
                const resp = await getDeviceList(page, this.pageSize)
                const { data } = resp
                this.list = data.list || []
                this.total = data.total || 0
                // 缓存到 Vuex，供详情页读取
                this.$store.dispatch('device/setDeviceList', this.list)
                this.currentPage = page
            } catch (e) {
                console.error(e)
            } finally {
                this.loading = false
            }
        },
    },
    created() {
        this.fetchDevices()
    },
}
</script>

<style scoped>
.devices-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.content {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
}

.device-card-wrapper {
    margin-bottom: 30px;
}

.device-card {
    cursor: pointer;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
    padding: 10px 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.device-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
    font-size: 48px;
    color: #409eff;
    margin-bottom: 10px;
}

.card-body {
    width: 100%;
    text-align: center;
}

.device-name {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
    color: #303133;
}

.device-mac {
    font-size: 13px;
    color: #909399;
    margin-bottom: 4px;
}

.device-created,
.device-updated,
.device-records {
    font-size: 12px;
    color: #606266;
    line-height: 18px;
}

.pagination-wrapper {
    padding: 12px 0;
    text-align: center;
}

/* 滚动条，沿用 draggable 样式 */
.my_scrollbar::-webkit-scrollbar {
    width: 5px;
    height: 10px;
    background-color: transparent;
}

.my_scrollbar::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: transparent;
}

.my_scrollbar::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: rgba(144, 147, 153, 0.7);
    transition: background-color 0.3s;
}
</style>
