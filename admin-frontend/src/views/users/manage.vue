<template>
    <div class="user-wrapper" v-loading="loading">
        <el-card>
            <!-- 搜索区域 -->
            <div class="toolbar">
                <el-input v-model="query.account" placeholder="账号" size="small" clearable class="mr-10"
                    style="width:150px" />
                <el-select v-model="query.role" placeholder="用户角色" size="small" clearable class="mr-10"
                    style="width:120px">
                    <el-option v-for="r in roles" :key="r" :label="r" :value="r" />
                </el-select>
                <el-select v-model="query.region" placeholder="代理区域" size="small" clearable class="mr-10"
                    style="width:120px">
                    <el-option v-for="rg in regions" :key="rg" :label="rg" :value="rg" />
                </el-select>
                <el-button type="primary" size="small" icon="el-icon-search" @click="handleSearch"
                    class="mr-10">搜索</el-button>
                <el-button type="success" size="small" icon="el-icon-plus" @click="showCreate = true">新建用户</el-button>
            </div>

            <!-- 创建用户对话框 -->
            <el-dialog title="创建用户" :visible.sync="showCreate" width="600px" class="create-dialog">
                <el-form :model="createForm" :rules="createRules" ref="createForm" label-width="120px">
                    <el-form-item label="账号" prop="account">
                        <el-input v-model="createForm.account" placeholder="请输入唯一账号" />
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="createForm.password" type="password" placeholder="至少8位，包含字母和数字" />
                    </el-form-item>
                    <el-form-item label="确认密码" prop="confirmPassword">
                        <el-input v-model="createForm.confirmPassword" type="password" placeholder="确认密码" />
                    </el-form-item>
                    <el-form-item label="角色" prop="role">
                        <el-select v-model="createForm.role" placeholder="请选择角色">
                            <el-option v-for="r in roles" :key="r" :label="r" :value="r" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="代理区域" prop="region">
                        <el-select v-model="createForm.region" placeholder="请选择区域">
                            <el-option v-for="rg in regions" :key="rg" :label="rg" :value="rg" />
                        </el-select>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="showCreate = false">取消</el-button>
                    <el-button type="primary" @click="submitCreate">确定</el-button>
                </div>
            </el-dialog>

            <el-table :data="list" style="width:100%" stripe fit>
                <el-table-column prop="account" label="账号" width="140" show-overflow-tooltip />
                <el-table-column prop="password" label="密码" width="180" show-overflow-tooltip />
                <el-table-column prop="role" label="用户角色" width="100" align="center" />
                <el-table-column prop="region" label="代理区域" width="120" align="center" />
                <el-table-column prop="last_login_at" label="最后登陆时间" min-width="180" />
                <el-table-column label="操作" width="90">
                    <template slot-scope="scope">
                        <el-button type="text" size="mini" @click="editUser(scope.row)">修改</el-button>
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
import { getUserList, registerUser } from '@/api/user'
export default {
    name: 'UserManage',
    data() {
        const validatePass = (rule, value, callback) => {
            if (value !== this.createForm.password) {
                callback(new Error('两次输入密码不一致'));
            } else {
                callback();
            }
        };
        const validateUsername = (rule, value, callback) => {
            if (!value) {
                callback(new Error('请输入账号'));
            } else {
                this.checkUserExists(value).then(res => {
                    if (res.exists) {
                        callback(new Error('账号已存在'));
                    } else {
                        callback();
                    }
                }).catch(() => callback(new Error('检查账号失败')));
            }
        };
        return {
            list: [], total: 0, page: 1, pageSize: 20, loading: false,
            query: { account: '', role: '', region: '' }, roles: ['admin', 'editor', 'viewer'], regions: ['华东', '华南', '华北', '西南', '海外'],
            showCreate: false,
            createForm: { username: '', password: '', confirmPassword: '', role: '', region: '' },
            createRules: {
                username: [
                    { required: true, validator: validateUsername, trigger: 'blur' },
                    { min: 3, max: 20, message: '账号长度在3-20位', trigger: 'blur' }
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
                role: [{ required: true, message: '请选择角色', trigger: 'change' }],
                region: [{ required: true, message: '请选择区域', trigger: 'change' }],
            }
        }
    },
    methods: {
        async loadData(page = 1) {
            this.loading = true
            try {
                const resp = await getUserList(page, this.pageSize)
                const filtered = this.filterList(resp.data.list)
                this.list = filtered
                this.total = filtered.length
                this.page = page
            } catch (e) { console.error(e) }
            finally { this.loading = false }
        },
        handleSearch() {
            this.page = 1
            this.loadData(1)
        },
        filterList(raw) {
            const { account, role, region } = this.query
            return raw.filter(u => {
                return (!account || u.account.includes(account)) &&
                    (!role || u.role === role) &&
                    (!region || u.region === region)
            })
        },
        editUser(row) {
            this.$message.info('点击修改:' + row.account)
        },
        submitCreate() {
            this.$refs.createForm.validate(async (valid) => {
                if (!valid) return
                try {
                    const resp = await registerUser(this.createForm)
                    this.$message.success('创建成功')
                    this.showCreate = false
                    this.createForm = { account: '', password: '', confirmPassword: '', role: '', region: '' }
                    this.loadData(1)
                } catch (e) {
                    this.$message.error('创建失败: ' + e.message)
                }
            })
        },
        async checkUserExists(username) {
            // 实际API调用，例如：
            // const res = await checkUsernameAPI(username);
            // return { exists: res.exists };
            // 占位返回
            return { exists: false };
        }
    },
    created() { this.loadData() }
}
</script>
<style scoped>
.user-wrapper {
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
</style>