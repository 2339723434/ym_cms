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
                <el-descriptions-item label="MAC 地址">
                    <span class="mac-address">{{ data.mac_address }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="经纬度">{{ data.latitude }}, {{ data.longitude }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ formatDate(data.created_at) }}</el-descriptions-item>
                <el-descriptions-item label="最后更新">{{ formatDate(data.last_updated) }}</el-descriptions-item>
                <el-descriptions-item label="最后记录日期">{{ formatDate(data.last_record_date) }}</el-descriptions-item>
                <el-descriptions-item label="总记录数">{{ data.total_records }}</el-descriptions-item>
            </el-descriptions>
        </el-card>
        <!-- 日期统计图表 -->
        <el-card class="box-card" style="margin-top:20px;">
            <div ref="chart" style="width:100%;height:400px;"></div>
        </el-card>
        <!-- 导出表格 -->
        <el-card class="box-card" style="margin-top:20px;">
            <div class="table-toolbar">
                <el-button type="success" size="small" icon="el-icon-download" @click="exportTable">导出表格</el-button>
            </div>
            <el-table :data="pagedList" style="width:100%" stripe>
                <el-table-column prop="name" label="名称" width="150" />
                <el-table-column prop="mac_address" label="MAC 地址" width="280" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span class="mac-address">{{ scope.row.mac_address }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="date" label="日期" width="150" />
                <el-table-column prop="pause" label="Pause" width="100" />
                <el-table-column prop="shallow" label="Shallow" width="100" />
                <el-table-column prop="snore" label="Snore" width="100" />
                <el-table-column prop="hypopnea" label="Hypopnea" width="120" />
                <el-table-column prop="tiny" label="Tiny" width="100" />
            </el-table>
            <el-pagination background layout="prev, pager, next" :page-size="pageSize" :current-page.sync="currentPage"
                :total="total" @current-change="handlePageChange" style="text-align:right;margin-top:10px;" />
        </el-card>
    </div>
</template>

<script>
import { getDeviceDetail, getDeviceSleepReport } from '@/api/devices'
import * as echarts from 'echarts'
export default {
    name: 'DeviceDetail',
    data() {
        return {
            data: {},
            loading: false,
            dateList: [],  // 日期数据
            currentPage: 1,
            pageSize: 10,
        }
    },
    computed: {
        pagedList() {
            const start = (this.currentPage - 1) * this.pageSize
            return this.dateList.slice(start, start + this.pageSize)
        },
        total() {
            return this.dateList.length
        },
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
        async fetchChart(id) {
            try {
                const resp = await getDeviceSleepReport(id)
                const list = resp.result ? resp.result.data : resp.data
                this.renderChart(list || [])
            } catch (e) { console.error(e) }
        },
        renderChart(list) {
            const sortedList = list.sort((a, b) => new Date(b.date) - new Date(a.date))
            this.dateList = sortedList.map(item => ({ ...item, name: this.data.name, mac_address: this.data.mac_address }))  // 保存列表供表格使用
            if (sortedList.length > 0) {
                this.data.last_record_date = sortedList[0].date
            }
            if (!this.$refs.chart) return
            if (!this.chart) { this.chart = echarts.init(this.$refs.chart) }
            const chartList = [...list].sort((a, b) => new Date(a.date) - new Date(b.date))
            const dates = chartList.map(i => i.date)
            const keys = ['pause', 'shallow', 'snore', 'hypopnea', 'tiny']
            const series = keys.map(k => ({ name: k, type: 'line', data: chartList.map(i => i[k] || 0) }))
            this.chart.setOption({ tooltip: { trigger: 'axis' }, legend: { data: keys }, xAxis: { type: 'category', data: dates }, yAxis: { type: 'value' }, series })
        },
        handlePageChange(page) {
            this.currentPage = page
        },
        exportTable() {
            import('@/vendor/Export2Excel').then(excel => {
                const tHeader = ['名称', 'MAC 地址', '日期', 'Pause', 'Shallow', 'Snore', 'Hypopnea', 'Tiny']
                const filterVal = ['name', 'mac_address', 'date', 'pause', 'shallow', 'snore', 'hypopnea', 'tiny']
                const list = this.dateList
                const data = this.formatJson(filterVal, list)
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: '设备日期数据'
                })
            })
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => v[j]))
        },
        /**
         * 根据路由更新详情数据
         */
        async updateDetail(route) {
            // 优先使用路由params传递的设备对象
            if (route.params && route.params.deviceData) {
                this.data = route.params.deviceData
                // 获取图表数据
                this.fetchChart(this.data._id || this.data.id)
                return
            }

            // 如果没有传递设备对象，则通过ID查询
            if (route.query && route.query.id) {
                const cached = this.$store.getters['device/getDeviceById'](route.query.id)

                if (cached) {
                    this.data = cached
                } else {
                    await this.fetchDetail(route.query.id)
                    // 将新数据写入缓存
                    if (this.data && this.data._id) {
                        this.$store.dispatch('device/setDevice', this.data)
                    }
                }
                // 获取图表数据
                this.fetchChart(route.query.id)
            }
        },
    },
    /**
     * 当路由 query 或 params 改变时，组件实例会复用，
     * created 钩子不会再次触发，需要在 beforeRouteUpdate 中手动处理。
     */
    beforeRouteUpdate(to, from, next) {
        this.updateDetail(to)
        next()
    },
    created() {
        this.updateDetail(this.$route)
    },
    mounted() {
        // resize handler
        window.addEventListener('resize', () => { this.chart && this.chart.resize() })
    },
    watch: {
        '$route.query.id': function () {
            this.updateDetail(this.$route)
        },
        '$route.params': function () {
            this.updateDetail(this.$route)
        },
    },
}
</script>

<style scoped>
.device-detail {
    padding: 20px;
}

.table-toolbar {
    margin-bottom: 10px;
    text-align: right;
}

.mac-address {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-family: 'Courier New', Monaco, monospace;
    font-size: 13px;
    line-height: 1.2;
    display: inline-block;
    max-width: 100%;
}
</style>