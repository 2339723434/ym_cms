<template>
    <div class="agent-detail" v-loading="loading">
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>代理详情</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click="$router.back()">返回</el-button>
            </div>
            <el-descriptions :column="2" border>
                <el-descriptions-item label="代理ID">{{ agentData.id }}</el-descriptions-item>
                <el-descriptions-item label="代理账号">{{ agentData.account }}</el-descriptions-item>
                <el-descriptions-item label="代理姓名">{{ agentData.name }}</el-descriptions-item>
                <el-descriptions-item label="联系方式">{{ agentData.contact }}</el-descriptions-item>
                <el-descriptions-item label="代理区域">{{ getRegionName(agentData.region) }}</el-descriptions-item>
                <el-descriptions-item label="设备数量">{{ agentData.deviceCount }}</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ agentData.created_display || '--' }}</el-descriptions-item>
                <el-descriptions-item label="最后登录">{{ agentData.last_login_display || '--' }}</el-descriptions-item>
            </el-descriptions>
        </el-card>

        <!-- 代理管理的设备列表 -->
        <el-card class="box-card" style="margin-top:20px;">
            <div slot="header" class="clearfix">
                <span>管理的设备 ({{ deviceList.length }}台)</span>
                <div style="float: right;">
                    <el-input v-model="deviceQuery" placeholder="搜索设备名称或MAC地址" size="small" clearable
                        style="width: 250px; margin-right: 10px;" prefix-icon="el-icon-search">
                    </el-input>
                    <el-button type="primary" size="small" icon="el-icon-plus" @click="showAddDevice = true">
                        分配设备
                    </el-button>
                </div>
            </div>

            <el-table :data="filteredDeviceList" style="width:100%" stripe>
                <el-table-column prop="name" label="设备名称" width="200" show-overflow-tooltip />
                <el-table-column prop="mac_address" label="MAC地址" width="200" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span class="mac-address">{{ scope.row.mac_address }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100" align="center">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status === 'online' ? 'success' : 'info'" size="mini">
                            {{ scope.row.status === 'online' ? '在线' : '离线' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="last_record_date" label="最后数据时间" width="180" />
                <el-table-column prop="total_records" label="总记录数" width="120" align="center" />
                <el-table-column label="操作" width="150">
                    <template slot-scope="scope">
                        <el-button type="text" size="mini" @click="viewDevice(scope.row)">查看</el-button>
                        <el-button type="text" size="mini" style="color: #f56c6c;" @click="removeDevice(scope.row)">
                            移除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 分配设备对话框 -->
        <el-dialog title="分配设备" :visible.sync="showAddDevice" width="800px">
            <el-input v-model="availableDeviceQuery" placeholder="搜索可分配的设备" clearable style="margin-bottom: 15px;"
                prefix-icon="el-icon-search">
            </el-input>
            <el-table :data="filteredAvailableDevices" style="width: 100%" @selection-change="handleSelectionChange"
                max-height="400">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="name" label="设备名称" width="200" show-overflow-tooltip />
                <el-table-column prop="mac_address" label="MAC地址" width="200" show-overflow-tooltip>
                    <template slot-scope="scope">
                        <span class="mac-address">{{ scope.row.mac_address }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100" align="center">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status === 'online' ? 'success' : 'info'" size="mini">
                            {{ scope.row.status === 'online' ? '在线' : '离线' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="total_records" label="总记录数" align="center" />
            </el-table>
            <div slot="footer" class="dialog-footer">
                <el-button @click="showAddDevice = false">取消</el-button>
                <el-button type="primary" @click="assignDevices" :disabled="selectedDevices.length === 0">
                    分配选中设备 ({{ selectedDevices.length }})
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { getAgentDetail, getAgentDevices, getAvailableDevices, assignDevicesToAgent, removeDeviceFromAgent } from '@/api/agent'
import { chinaRegions } from '@/common/china-regions'

export default {
    name: 'AgentDetail',
    data() {
        return {
            loading: false,
            agentData: {},
            deviceList: [],
            deviceQuery: '',
            showAddDevice: false,
            availableDevices: [],
            availableDeviceQuery: '',
            selectedDevices: []
        }
    },
    computed: {
        filteredDeviceList() {
            if (!this.deviceQuery) return this.deviceList
            return this.deviceList.filter(device =>
                device.name.toLowerCase().includes(this.deviceQuery.toLowerCase()) ||
                device.mac_address.toLowerCase().includes(this.deviceQuery.toLowerCase())
            )
        },
        filteredAvailableDevices() {
            if (!this.availableDeviceQuery) return this.availableDevices
            return this.availableDevices.filter(device =>
                device.name.toLowerCase().includes(this.availableDeviceQuery.toLowerCase()) ||
                device.mac_address.toLowerCase().includes(this.availableDeviceQuery.toLowerCase())
            )
        }
    },
    methods: {
        async loadAgentDetail() {
            const agentId = this.$route.query.id
            if (!agentId) {
                this.$message.error('缺少代理ID参数')
                this.$router.back()
                return
            }

            this.loading = true
            try {
                // 获取代理基本信息
                const agentResp = await getAgentDetail(agentId)
                this.agentData = agentResp.data || {}

                // 获取代理管理的设备
                const devicesResp = await getAgentDevices(agentId)
                this.deviceList = devicesResp.data || []

            } catch (error) {
                console.error('加载代理详情失败:', error)
                this.$message.error('加载代理详情失败: ' + error.message)
                this.agentData = {}
                this.deviceList = []
            } finally {
                this.loading = false
            }
        },

        async loadAvailableDevices() {
            try {
                const resp = await getAvailableDevices()
                this.availableDevices = resp.data || []
            } catch (error) {
                console.error('加载可分配设备失败:', error)
                // 模拟数据
                this.availableDevices = [
                    {
                        id: 4,
                        name: 'AC-Master-1',
                        mac_address: 'F0:10:A5:72:91:3A',
                        status: 'offline',
                        total_records: 0
                    },
                    {
                        id: 5,
                        name: 'AC-Master-C31A',
                        mac_address: 'C4:D3:6A:8B:C3:1A',
                        status: 'online',
                        total_records: 456
                    }
                ]
            }
        },

        handleSelectionChange(selection) {
            this.selectedDevices = selection
        },

        async assignDevices() {
            if (this.selectedDevices.length === 0) {
                this.$message.warning('请选择要分配的设备')
                return
            }

            try {
                const deviceIds = this.selectedDevices.map(device => device.id)
                await assignDevicesToAgent(this.agentData.id, deviceIds)
                this.$message.success(`成功分配 ${this.selectedDevices.length} 台设备`)
                this.showAddDevice = false
                this.selectedDevices = []
                this.loadAgentDetail() // 重新加载数据
            } catch (error) {
                this.$message.error('分配设备失败: ' + error.message)
            }
        },

        viewDevice(device) {
            this.$router.push({
                path: '/devices/detail',
                query: { id: device.id }
            })
        },

        async removeDevice(device) {
            this.$confirm(`确定要将设备 "${device.name}" 从此代理移除吗？`, '确认操作', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                try {
                    await removeDeviceFromAgent(this.agentData.id, device.id)
                    this.$message.success('设备移除成功')
                    this.loadAgentDetail() // 重新加载数据
                } catch (error) {
                    this.$message.error('移除设备失败: ' + error.message)
                }
            }).catch(() => {
                // 用户取消操作
            })
        },

        formatDate(dateStr) {
            if (!dateStr) return '-'
            return dateStr.replace('T', ' ').split('.')[0]
        },

        getRegionName(regionCode) {
            if (!regionCode) return '--'

            // 遍历省市数据查找对应名称
            for (const province of chinaRegions) {
                if (province.value === regionCode) {
                    return province.label
                }

                if (province.children) {
                    for (const city of province.children) {
                        if (city.value === regionCode) {
                            return city.label
                        }
                    }
                }
            }

            return regionCode // 如果找不到，返回原代码
        }
    },

    created() {
        this.loadAgentDetail()
    },

    watch: {
        showAddDevice(val) {
            if (val) {
                this.loadAvailableDevices()
            }
        }
    }
}
</script>

<style scoped>
.agent-detail {
    padding: 20px;
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

.box-card {
    margin-bottom: 20px;
}

.clearfix::after {
    content: "";
    display: table;
    clear: both;
}
</style>