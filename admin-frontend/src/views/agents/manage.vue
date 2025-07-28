<template>
    <div class="agent-wrapper" v-loading="loading">
        <el-card>
            <!-- 搜索区域 -->
            <div class="toolbar">
                <el-input v-model="query.account" placeholder="代理账号" size="small" clearable class="mr-10"
                    style="width:150px" />
                <el-input v-model="query.name" placeholder="代理姓名" size="small" clearable class="mr-10"
                    style="width:150px" />
                <el-cascader v-model="query.region" :options="chinaRegions" :props="{
                    value: 'value',
                    label: 'label',
                    children: 'children',
                    emitPath: false
                }" placeholder="代理区域" size="small" clearable filterable class="mr-10" style="width:160px">
                </el-cascader>
                <el-button type="primary" size="small" icon="el-icon-search" @click="handleSearch"
                    class="mr-10">搜索</el-button>
                <el-button type="success" size="small" icon="el-icon-plus" @click="showCreate = true">新建代理</el-button>
            </div>

            <!-- 创建代理对话框 -->
            <el-dialog title="创建代理" :visible.sync="showCreate" width="600px" class="create-dialog">
                <el-form :model="createForm" :rules="createRules" ref="createForm" label-width="120px">
                    <el-form-item label="代理账号" prop="account">
                        <el-input v-model="createForm.account" placeholder="请输入唯一账号" />
                    </el-form-item>
                    <el-form-item label="代理姓名" prop="name">
                        <el-input v-model="createForm.name" placeholder="请输入代理姓名" />
                    </el-form-item>
                    <el-form-item label="联系方式" prop="contact">
                        <el-input v-model="createForm.contact" placeholder="请输入手机号码" />
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="createForm.password" type="password" placeholder="至少8位，包含字母和数字" />
                    </el-form-item>
                    <el-form-item label="确认密码" prop="confirmPassword">
                        <el-input v-model="createForm.confirmPassword" type="password" placeholder="确认密码" />
                    </el-form-item>
                    <el-form-item label="代理区域" prop="region">
                        <el-cascader v-model="createForm.region" :options="chinaRegions" :props="{
                            value: 'value',
                            label: 'label',
                            children: 'children',
                            emitPath: false
                        }" placeholder="请选择省市" clearable filterable style="width: 100%">
                        </el-cascader>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="showCreate = false">取消</el-button>
                    <el-button type="primary" @click="submitCreate">确定</el-button>
                </div>
            </el-dialog>

            <el-table :data="list" style="width:100%" stripe fit @row-click="handleRowClick" class="clickable-table">
                <el-table-column prop="account" label="代理账号" width="140" show-overflow-tooltip />
                <el-table-column prop="name" label="代理姓名" width="120" show-overflow-tooltip />
                <el-table-column prop="contact" label="联系方式" width="140" show-overflow-tooltip />
                <el-table-column prop="region" label="代理区域" width="120" align="center">
                    <template slot-scope="scope">
                        {{ getRegionName(scope.row.region) }}
                    </template>
                </el-table-column>
                <el-table-column prop="deviceCount" label="设备数量" width="100" align="center" />
                <el-table-column prop="last_login_display" label="最后登陆时间" min-width="180" />
                <el-table-column label="操作" width="90" @click.native.stop>
                    <template slot-scope="scope">
                        <el-button type="text" size="mini" @click.stop="editAgent(scope.row)">修改</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div style="text-align:right;margin-top:10px;">
                <el-pagination background layout="prev, pager, next" :page-size="pageSize" :current-page.sync="page"
                    :total="total" @current-change="loadData" />
            </div>
        </el-card>
    </div>
</template>
<script>
import { getAgentList, createAgentAcc } from '@/api/agent'
import { chinaRegions } from '@/common/china-regions'
export default {
    name: 'AgentManage',
    data() {
        const validatePass = (rule, value, callback) => {
            if (value !== this.createForm.password) {
                callback(new Error('两次输入密码不一致'));
            } else {
                callback();
            }
        };
        const validateAccount = (rule, value, callback) => {
            if (!value) {
                callback(new Error('请输入账号'));
            } else {
                this.checkAgentExists(value).then(res => {
                    if (res.exists) {
                        callback(new Error('账号已存在'));
                    } else {
                        callback();
                    }
                }).catch(() => callback(new Error('检查账号失败')));
            }
        };
        const validateContact = (rule, value, callback) => {
            if (!value) {
                callback(new Error('请输入联系方式'));
            } else {
                const phonePattern = /^1[3-9]\d{9}$/;
                if (!phonePattern.test(value)) {
                    callback(new Error('请输入正确的手机号码'));
                } else {
                    callback();
                }
            }
        };
        return {
            list: [], total: 0, page: 1, pageSize: 20, loading: false,
            query: { account: '', name: '', region: '' },
            chinaRegions,
            showCreate: false,
            createForm: { account: '', name: '', contact: '', password: '', confirmPassword: '', region: '' },
            createRules: {
                account: [
                    { required: true, validator: validateAccount, trigger: 'blur' },
                    { min: 3, max: 20, message: '账号长度在3-20位', trigger: 'blur' }
                ],
                name: [
                    { required: true, message: '请输入代理姓名', trigger: 'blur' },
                    { min: 2, max: 10, message: '姓名长度在2-10位', trigger: 'blur' }
                ],
                contact: [
                    { required: true, validator: validateContact, trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 8, message: '密码至少8位', trigger: 'blur' },
                    { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, message: '密码必须包含字母和数字', trigger: 'blur' }
                ],
                confirmPassword: [
                    { required: true, message: '请确认密码', trigger: 'blur' },
                    { validator: validatePass, trigger: 'blur' }
                ],
                region: [{ required: true, message: '请选择区域', trigger: 'change' }],
            }
        }
    },
    methods: {
        async loadData(page = 1) {
            this.loading = true
            try {
                const resp = await getAgentList(page, this.pageSize, this.query)
                this.list = resp.data.list || []
                this.total = resp.data.total || 0
                this.page = page
            } catch (e) {
                console.error(e)
                this.$message.error('获取代理列表失败')
                this.list = []
                this.total = 0
            }
            finally { this.loading = false }
        },
        handleSearch() {
            this.page = 1
            this.loadData(1)
        },
        handleRowClick(row) {
            // 点击行进入代理详情页面
            this.$router.push({
                path: '/agents/detail',
                query: { id: row.id }
            })
        },
        editAgent(row) {
            this.$message.info('点击修改代理:' + row.name)
        },
        submitCreate() {
            this.$refs.createForm.validate(async (valid) => {
                if (!valid) return
                try {
                    const resp = await createAgentAcc(this.createForm)
                    this.$message.success('创建成功')
                    this.showCreate = false
                    this.createForm = { account: '', name: '', contact: '', password: '', confirmPassword: '', region: '' }
                    this.loadData(1)
                } catch (e) {
                    this.$message.error('创建失败: ' + e.message)
                }
            })
        },
        async checkAgentExists(account) {
            // 实际API调用，例如：
            // const res = await checkAgentExistsAPI(account);
            // return { exists: res.exists };
            // 占位返回
            return { exists: false };
        },
        getRegionName(regionCode) {
            if (!regionCode) return '--'

            // 遍历省市数据查找对应名称
            for (const province of this.chinaRegions) {
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
    created() { this.loadData() }
}
</script>
<style scoped>
.agent-wrapper {
    padding: 15px;
}

.toolbar {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.mr-10 {
    margin-right: 10px;
}

.el-table th,
.el-table td {
    padding: 6px 10px;
}

.create-dialog .el-dialog__body {
    padding: 20px 40px;
}

.create-dialog .el-form-item {
    margin-bottom: 24px;
}

.clickable-table {
    cursor: pointer;
}

.clickable-table .el-table__row:hover {
    background-color: #ecf5ff !important;
}

.clickable-table .el-table__row {
    transition: background-color 0.2s;
}
</style>