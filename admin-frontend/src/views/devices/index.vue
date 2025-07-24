<template>
    <div class="devices-wrapper">
        <!-- 全屏加载遮罩 -->
        <div class="loading-mask" v-if="loading">
            <i class="el-icon-loading loading-icon"></i>
            <span class="loading-text">加载中...</span>
        </div>
        <el-row class="content my_scrollbar" gutter="30" v-show="!loading">
            <el-col v-for="(device, index) in pagedDevices" :key="device._id" :xs="12" :sm="8" :md="6" :lg="4" :xl="4"
                class="device-card-wrapper">
                <div class="device-card" @click="goDetail(device)">
                    <div class="card-header">
                        <i class="el-icon-cpu"></i>
                    </div>
                    <div class="card-body">
                        <div class="device-name" :title="device.name">{{ device.name }}</div>
                        <div class="device-mac">{{ device.mac_address }}</div>
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
import { getDeviceList, updateDeviceUsage } from '@/api/devices'
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
            // 跳转时仅携带 id，设备数据写入 Vuex，详情页自行读取或请求
            this.$router.push({ path: '/devices/detail', query: { id: device._id } })
        },
        async fetchDevices(page = 1) {
            // 保持 loading 状态
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
        // 全局 loading
        this.loading = true
        updateDeviceUsage()
            .catch((e) => console.error('update usage fail', e))
            .finally(() => this.fetchDevices())
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
    min-height: 140px;
    /* 保证各卡片高度一致，可按需调整 */
}

.device-name {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.device-mac {
    font-size: 13px;
    color: #909399;
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

.loading-mask {
position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
background: rgba(255,255,255,0.8);
z-index: 2000;
}
.loading-icon {
font-size: 32px;
color: #409eff;
}
.loading-text {
margin-top: 8px;
font-size: 14px;
color: #606266;
}
