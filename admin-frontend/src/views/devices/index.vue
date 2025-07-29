<template>
    <div class="devices-wrapper">
        <!-- 全屏加载遮罩 -->
        <div class="loading-mask" v-if="loading">
            <div class="loading-content">
                <i class="el-icon-loading loading-icon"></i>
                <span class="loading-text">加载中，请稍候...</span>
            </div>
        </div>

        <!-- 搜索区域 -->
        <div class="search-section" v-show="!loading">
            <el-card class="search-card">
                <div class="search-form">
                    <el-input v-model="searchQuery" placeholder="搜索设备名称或MAC地址" prefix-icon="el-icon-search" clearable
                        class="search-input" @keyup.enter.native="handleSearch" @clear="handleClearSearch">
                    </el-input>
                    <el-button type="primary" icon="el-icon-search" @click="handleSearch" class="search-btn">
                        搜索
                    </el-button>
                    <el-button v-if="searchQuery" @click="handleClearSearch" class="clear-btn">
                        清空
                    </el-button>
                </div>
                <div v-if="searchQuery" class="search-result-info">
                    <span>搜索 "{{ searchQuery }}" 找到 {{ total }} 个结果</span>
                </div>
            </el-card>
        </div>

        <div class="content my_scrollbar" v-show="!loading">
            <!-- 无搜索结果提示 -->
            <div v-if="searchQuery && list.length === 0" class="no-results">
                <div class="no-results-content">
                    <i class="el-icon-search no-results-icon"></i>
                    <p class="no-results-text">未找到匹配的设备</p>
                    <p class="no-results-tip">请尝试其他关键词或<el-button type="text"
                            @click="handleClearSearch">清空搜索条件</el-button></p>
                </div>
            </div>

            <!-- 设备列表 -->
            <el-row gutter="30" v-else>
                <el-col v-for="(device, index) in list" :key="device._id" :xs="12" :sm="8" :md="6" :lg="4" :xl="4"
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
        </div>

        <div class="pagination-wrapper" v-show="!loading && total > 0">
            <el-pagination background layout="prev, pager, next" :page-size="pageSize" :current-page.sync="currentPage"
                :total="total" @current-change="handlePageChange" />
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
            searchQuery: '',
        }
    },
    computed: {
        // 移除filteredDevices、pagedDevices
    },
    methods: {
        formatDate(val) {
            if (!val) return '--'
            const date = new Date(val)
            return date.toLocaleString()
        },
        goDetail(device) {
            this.$router.push({
                name: 'DeviceDetail',
                params: { deviceData: device },
                query: { id: device._id }
            })
        },
        async fetchDevices(page = 1) {
            this.loading = true
            try {
                const resp = await getDeviceList(page, this.pageSize, this.searchQuery)
                const { data } = resp
                this.list = data.list || []
                this.total = data.total || 0
                this.currentPage = page
                // 缓存到 Vuex，供详情页读取
                this.$store.dispatch('device/setDeviceList', this.list)
            } catch (e) {
                console.error(e)
            } finally {
                this.loading = false
            }
        },
        handleSearch() {
            this.currentPage = 1
            this.fetchDevices(1)
        },
        handleClearSearch() {
            this.searchQuery = ''
            this.currentPage = 1
            this.fetchDevices(1)
        },
        handlePageChange(page) {
            this.currentPage = page
            this.fetchDevices(page)
        },
    },
    created() {
        this.fetchDevices()
    },
    watch: {
        // 移除searchQuery的watch
    }
}
</script>

<style scoped>
.devices-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.loading-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.loading-content {
    text-align: center;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.loading-icon {
    font-size: 32px;
    color: #409EFF;
}

.loading-text {
    display: block;
    margin-top: 10px;
    font-size: 16px;
    color: #303133;
}

.search-section {
    padding: 15px 15px 0 15px;
}

.search-card {
    margin-bottom: 0;
}

.search-form {
    display: flex;
    align-items: center;
    gap: 10px;
}

.search-input {
    flex: 1;
    max-width: 400px;
}

.search-btn {
    min-width: 80px;
}

.clear-btn {
    min-width: 60px;
}

.search-result-info {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #ebeef5;
    color: #606266;
    font-size: 14px;
}

.content {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
}

.no-results {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    padding: 40px 20px;
}

.no-results-content {
    text-align: center;
}

.no-results-icon {
    font-size: 64px;
    color: #c0c4cc;
    margin-bottom: 20px;
}

.no-results-text {
    font-size: 18px;
    color: #606266;
    margin: 0 0 10px 0;
}

.no-results-tip {
    font-size: 14px;
    color: #909399;
    margin: 0;
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
    font-family: 'Courier New', Monaco, monospace;
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
