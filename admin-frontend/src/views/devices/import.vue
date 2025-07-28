<template>
    <div class="import-devices-wrapper" v-loading="loading">
        <el-card>
            <div slot="header" class="clearfix">
                <span>导入设备</span>
                <el-button type="text" style="float: right; padding: 3px 0" @click="downloadTemplate">下载模板</el-button>
            </div>

            <!-- 文件上传区域 -->
            <div class="upload-section">
                <el-upload ref="upload" class="upload-demo" drag action="#" :before-upload="beforeUpload"
                    :file-list="fileList" :auto-upload="false" accept=".csv,.xlsx,.xls" :limit="1"
                    :on-exceed="handleExceed" :on-remove="handleRemove" :on-change="handleChange">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__tip" slot="tip">支持 CSV 和 XLSX 格式文件，文件大小不超过10MB</div>
                </el-upload>

                <div class="upload-actions" v-if="fileList.length > 0">
                    <el-button type="primary" @click="parseFile" :disabled="parsing">
                        <i class="el-icon-refresh" v-if="parsing"></i>
                        {{ parsing ? '解析中...' : '解析文件' }}
                    </el-button>
                    <el-button @click="clearFiles">清空文件</el-button>
                </div>
            </div>

            <!-- 数据预览区域 -->
            <div class="preview-section" v-if="parsedData.length > 0">
                <div class="section-header">
                    <span>数据预览 (共 {{ parsedData.length }} 条记录)</span>
                    <div class="header-actions">
                        <el-button type="success" @click="importData" :disabled="importing">
                            <i class="el-icon-loading" v-if="importing"></i>
                            {{ importing ? '导入中...' : '导入数据' }}
                        </el-button>
                    </div>
                </div>

                <el-table :data="displayData" style="width: 100%" stripe border max-height="400">
                    <el-table-column type="index" label="序号" width="60" />
                    <el-table-column prop="regionId" label="区域代理ID" width="140" show-overflow-tooltip />
                    <el-table-column prop="agentName" label="代理人" width="120" show-overflow-tooltip />
                    <el-table-column prop="contact" label="联系方式" width="140" show-overflow-tooltip />
                    <el-table-column prop="deviceName" label="设备名称" width="180" show-overflow-tooltip />
                    <el-table-column prop="macAddress" label="MAC地址" width="200" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <span class="mac-address">{{ scope.row.macAddress }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" width="100">
                        <template slot-scope="scope">
                            <el-tag v-if="scope.row.valid" type="success" size="mini">有效</el-tag>
                            <el-tag v-else type="danger" size="mini">无效</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="error" label="错误信息" min-width="200" show-overflow-tooltip>
                        <template slot-scope="scope">
                            <span v-if="scope.row.error" class="error-text">{{ scope.row.error }}</span>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 分页 -->
                <div class="pagination-wrapper" v-if="parsedData.length > pageSize">
                    <el-pagination background layout="prev, pager, next" :page-size="pageSize"
                        :current-page.sync="currentPage" :total="parsedData.length"
                        @current-change="handlePageChange" />
                </div>
            </div>

            <!-- 导入结果 -->
            <div class="result-section" v-if="importResult">
                <el-alert :title="importResult.success ? '导入成功' : '导入失败'"
                    :type="importResult.success ? 'success' : 'error'" :description="importResult.message" show-icon
                    :closable="false" />

                <div v-if="importResult.details" class="result-details">
                    <p>成功导入设备: {{ importResult.details.deviceSuccess || 0 }} 条</p>
                    <p>成功导入代理: {{ importResult.details.agentSuccess || 0 }} 条</p>
                    <p v-if="importResult.details.errors && importResult.details.errors.length > 0">
                        失败记录: {{ importResult.details.errors.length }} 条
                    </p>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script>
import * as XLSX from 'xlsx'
import { importDevices, importAgent } from '@/api/devices'

export default {
    name: 'ImportDevices',
    data() {
        return {
            loading: false,
            parsing: false,
            importing: false,
            fileList: [],
            parsedData: [],
            currentPage: 1,
            pageSize: 20,
            importResult: null,
        }
    },
    computed: {
        displayData() {
            const start = (this.currentPage - 1) * this.pageSize
            return this.parsedData.slice(start, start + this.pageSize)
        },
        validData() {
            return this.parsedData.filter(item => item.valid)
        },
    },
    methods: {
        beforeUpload(file) {
            const isValidType = /\.(csv|xlsx|xls)$/i.test(file.name)
            const isLt10M = file.size / 1024 / 1024 < 10

            if (!isValidType) {
                this.$message.error('请上传 CSV 或 XLSX 格式的文件!')
                return false
            }
            if (!isLt10M) {
                this.$message.error('上传文件大小不能超过 10MB!')
                return false
            }
            return false // 阻止自动上传
        },

        handleChange(file, fileList) {
            // 清空之前的数据
            this.parsedData = []
            this.importResult = null

            // 如果文件被移除或fileList为空，清空fileList
            if (!file || fileList.length === 0) {
                this.fileList = []
                return
            }

            // 获取原始文件对象
            const rawFile = file.raw || file

            // 验证文件
            const isValidType = /\.(csv|xlsx|xls)$/i.test(rawFile.name)
            const isLt10M = rawFile.size / 1024 / 1024 < 10

            if (!isValidType) {
                this.$message.error('请上传 CSV 或 XLSX 格式的文件!')
                this.$nextTick(() => {
                    this.$refs.upload.clearFiles()
                    this.fileList = []
                })
                return
            }

            if (!isLt10M) {
                this.$message.error('上传文件大小不能超过 10MB!')
                this.$nextTick(() => {
                    this.$refs.upload.clearFiles()
                    this.fileList = []
                })
                return
            }

            // 文件验证通过，更新fileList
            this.fileList = fileList.map(f => ({
                name: f.name,
                size: f.size,
                raw: f.raw || f,
                uid: f.uid || Date.now() + Math.random(),
                status: f.status || 'ready'
            }))
        },

        handleExceed() {
            this.$message.warning('只能上传一个文件，请先删除已上传的文件')
        },

        handleRemove(file, fileList) {
            this.fileList = []
            this.parsedData = []
            this.importResult = null
        },

        clearFiles() {
            this.$refs.upload.clearFiles()
            this.fileList = []
            this.parsedData = []
            this.importResult = null
        },

        async parseFile() {
            if (this.fileList.length === 0) {
                this.$message.warning('请先选择文件')
                return
            }

            this.parsing = true
            this.importResult = null

            try {
                const file = this.fileList[0].raw
                const data = await this.readFile(file)
                this.parsedData = this.validateData(data)
                this.currentPage = 1

                const validCount = this.validData.length
                const totalCount = this.parsedData.length

                if (validCount === 0) {
                    this.$message.warning('未找到有效数据，请检查文件格式')
                } else if (validCount < totalCount) {
                    this.$message.warning(`解析完成，有效数据 ${validCount} 条，无效数据 ${totalCount - validCount} 条`)
                } else {
                    this.$message.success(`解析完成，共 ${totalCount} 条有效数据`)
                }
            } catch (error) {
                this.$message.error('文件解析失败: ' + error.message)
            } finally {
                this.parsing = false
            }
        },

        async readFile(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = (e) => {
                    try {
                        const data = e.target.result
                        let workbook

                        if (file.name.toLowerCase().endsWith('.csv')) {
                            // CSV文件处理
                            workbook = XLSX.read(data, { type: 'binary', codepage: 65001 })
                        } else {
                            // Excel文件处理
                            workbook = XLSX.read(data, { type: 'binary' })
                        }

                        const firstSheetName = workbook.SheetNames[0]
                        const worksheet = workbook.Sheets[firstSheetName]
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

                        resolve(jsonData)
                    } catch (error) {
                        reject(new Error('文件读取失败: ' + error.message))
                    }
                }
                reader.onerror = () => reject(new Error('文件读取失败'))
                reader.readAsBinaryString(file)
            })
        },

        validateData(rawData) {
            if (!rawData || rawData.length === 0) {
                return []
            }

            // 跳过表头，从第二行开始
            const dataRows = rawData.slice(1)

            return dataRows.map((row, index) => {
                const item = {
                    regionId: row[0] ? String(row[0]).trim() : '',
                    agentName: row[1] ? String(row[1]).trim() : '',
                    contact: row[2] ? String(row[2]).trim() : '',
                    deviceName: row[3] ? String(row[3]).trim() : '',
                    macAddress: row[4] ? String(row[4]).trim() : '',
                    valid: true,
                    error: '',
                    rowIndex: index + 2, // 实际行号（从2开始，因为跳过了表头）
                }

                // 数据验证
                const errors = []

                if (!item.regionId) {
                    errors.push('区域代理ID不能为空')
                }

                if (!item.agentName) {
                    errors.push('代理人不能为空')
                }

                if (!item.contact) {
                    errors.push('联系方式不能为空')
                } else if (!this.validateContact(item.contact)) {
                    errors.push('联系方式格式不正确')
                }

                if (!item.deviceName) {
                    errors.push('设备名称不能为空')
                }

                if (!item.macAddress) {
                    errors.push('MAC地址不能为空')
                } else if (!this.validateMacAddress(item.macAddress)) {
                    errors.push('MAC地址格式不正确')
                }

                if (errors.length > 0) {
                    item.valid = false
                    item.error = errors.join('; ')
                }

                return item
            }).filter(item => item.regionId || item.agentName || item.contact || item.deviceName || item.macAddress) // 过滤空行
        },

        validateContact(contact) {
            // 验证联系方式格式，支持手机号码
            const phonePattern = /^1[3-9]\d{9}$/ // 中国大陆手机号
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // 邮箱格式

            return phonePattern.test(contact) || emailPattern.test(contact)
        },

        validateMacAddress(mac) {
            // 支持两种格式: F0:10:A5:72:91:2A 和 F7637A42-6DE6-4BDF-C8B5-A2FDA2AC1C74
            const macPattern1 = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/ // XX:XX:XX:XX:XX:XX
            const macPattern2 = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/ // UUID格式

            return macPattern1.test(mac) || macPattern2.test(mac)
        },

        async importData() {
            if (this.validData.length === 0) {
                this.$message.warning('没有有效数据可导入')
                return
            }

            this.importing = true
            this.importResult = null

            try {
                // 提取唯一的代理数据
                const agentMap = new Map()
                this.validData.forEach(item => {
                    const key = `${item.regionId}-${item.agentName}`
                    if (!agentMap.has(key)) {
                        agentMap.set(key, {
                            regionId: item.regionId,
                            agentName: item.agentName,
                            contact: item.contact,
                        })
                    }
                })
                const agents = Array.from(agentMap.values())

                // 设备数据
                const devices = this.validData.map(item => ({
                    regionId: item.regionId,
                    agentName: item.agentName,
                    contact: item.contact,
                    deviceName: item.deviceName,
                    macAddress: item.macAddress,
                }))

                // 先导入代理，再导入设备
                const agentResult = await importAgent(agents)
                const deviceResult = await importDevices(devices)

                this.importResult = {
                    success: true,
                    message: '数据导入成功',
                    details: {
                        agentSuccess: agents.length,
                        deviceSuccess: devices.length,
                        errors: [],
                    },
                }

                this.$message.success('数据导入成功!')

                // 清空数据
                setTimeout(() => {
                    this.clearFiles()
                }, 2000)

            } catch (error) {
                this.importResult = {
                    success: false,
                    message: error.message || '导入失败',
                    details: null,
                }
                this.$message.error('导入失败: ' + error.message)
            } finally {
                this.importing = false
            }
        },

        handlePageChange(page) {
            this.currentPage = page
        },

        downloadTemplate() {
            // 创建模板数据
            const templateData = [
                ['区域代理ID', '代理人', '联系方式', '设备名称', 'MAC地址'],
                ['region_12345', '张希宁', '18888888888', 'AC-Master-0', 'F0:10:A5:72:91:2A'],
                ['region_12346', '张希宁', '18888888888', 'AC-Master-C30A', 'C4:D3:6A:8B:C3:0A'],
                ['region_12347', '张希宁', '18888888888', 'AC-Master-9BF3', '18:04:ED:C8:9B:F3'],
            ]

            // 创建工作簿
            const wb = XLSX.utils.book_new()
            const ws = XLSX.utils.aoa_to_sheet(templateData)

            // 设置列宽
            ws['!cols'] = [
                { wch: 15 }, // 区域代理ID
                { wch: 10 }, // 代理人
                { wch: 15 }, // 联系方式
                { wch: 20 }, // 设备名称
                { wch: 25 }, // MAC地址
            ]

            XLSX.utils.book_append_sheet(wb, ws, '设备导入模板')

            // 下载文件
            XLSX.writeFile(wb, '设备导入模板.xlsx')
        },
    },
}
</script>

<style scoped>
.import-devices-wrapper {
    padding: 20px;
}

.upload-section {
    margin-bottom: 30px;
}

.upload-demo {
    margin-bottom: 20px;
}

.upload-actions {
    text-align: center;
}

.preview-section {
    margin-bottom: 30px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ebeef5;
}

.section-header span {
    font-weight: 600;
    font-size: 16px;
}

.header-actions {
    display: flex;
    gap: 10px;
}

.pagination-wrapper {
    text-align: right;
    margin-top: 15px;
}

.result-section {
    margin-top: 20px;
}

.result-details {
    margin-top: 15px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 4px;
}

.result-details p {
    margin: 5px 0;
    color: #606266;
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

.error-text {
    color: #f56c6c;
    font-size: 12px;
}

.el-upload__tip {
    color: #999;
    font-size: 12px;
}
</style>