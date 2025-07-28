<template>
    <div class="all-device-data">
        <el-card class="card-style">
            <el-form inline class="search-form">
                <el-form-item label="MAC地址">
                    <el-input v-model="search.mac_address" placeholder="输入MAC地址" clearable></el-input>
                </el-form-item>
                <el-form-item label="日期">
                    <el-date-picker v-model="search.date" type="date" placeholder="选择日期" value-format="yyyy-MM-dd"
                        clearable></el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="fetchData(1)">搜索</el-button>
                    <el-button type="success" icon="el-icon-download" @click="exportTable">导出当前页</el-button>
                </el-form-item>
            </el-form>
            <el-table :data="list" style="width:100%" stripe v-loading="loading" class="data-table">
                <el-table-column prop="mac_address" label="MAC 地址" width="280" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span class="mac-address">{{ scope.row.mac_address }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="date" label="日期" width="180" />
                <el-table-column prop="pause" label="Pause" width="150" />
                <el-table-column prop="shallow" label="Shallow" width="150" />
                <el-table-column prop="snore" label="Snore" width="150" />
                <el-table-column prop="hypopnea" label="Hypopnea" width="160" />
                <el-table-column prop="tiny" label="Tiny" width="150" />
            </el-table>
            <el-pagination background layout="prev, pager, next" :page-size="pageSize" :current-page.sync="currentPage"
                :total="total" @current-change="fetchData" style="text-align:right;margin-top:10px;" />
        </el-card>
    </div>
</template>

<script>
import { getAllDeviceData } from '@/api/devices'

export default {
    name: 'AllDeviceData',
    data() {
        return {
            list: [],
            total: 0,
            currentPage: 1,
            pageSize: 20,
            loading: false,
            search: {
                mac_address: '',
                date: '',
            },
        }
    },
    methods: {
        async fetchData(page = this.currentPage) {
            this.loading = true
            this.currentPage = page
            try {
                const { data, total } = await getAllDeviceData(page, this.pageSize, this.search.mac_address, this.search.date)
                this.list = data
                this.total = total
            } catch (e) {
                console.error(e)
                this.$message.error('获取数据失败')
            } finally {
                this.loading = false
            }
        },
        exportTable() {
            import('@/vendor/Export2Excel').then(excel => {
                const tHeader = ['MAC 地址', '日期', 'Pause', 'Shallow', 'Snore', 'Hypopnea', 'Tiny']
                const filterVal = ['mac_address', 'date', 'pause', 'shallow', 'snore', 'hypopnea', 'tiny']
                const data = this.formatJson(filterVal, this.list)
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: '设备数据'
                })
            })
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => v[j] ?? ''))
        },
    },
    created() {
        this.fetchData()
    },
}
</script>

<style scoped>
.all-device-data {
    padding: 20px;
    background-color: #f0f2f5;
}

.card-style {
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-form {
    margin-bottom: 20px;
}

.data-table {
    margin-bottom: 20px;
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