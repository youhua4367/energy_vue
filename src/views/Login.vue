<script setup lang="ts">
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { login } from "@/api/user.ts"
import { useTokenStore } from "@/store/token.ts"

const tokenStore = useTokenStore()
const router = useRouter()
const formRef = ref()

const form = reactive({
    username: "",
    password: ""
})

// 登录按钮loading状态
const loginLoading = ref(false)

const handleLogin = async () => {
    if (!form.username || !form.password) {
        ElMessage.warning("请输入用户名和密码")
        return
    }

    try {
        loginLoading.value = true
        const res = (await login(form)).data

        const token = res.token
        const role = res.role

        tokenStore.setToken(token, role)
        ElMessage.success("登录成功")
        await router.push("/")
    } catch (e) {
        ElMessage.error("登录失败，请检查账号或密码")
    } finally {
        loginLoading.value = false
    }
}
</script>

<template>
    <div class="login-container">
        <!-- 登录卡片 -->
        <el-card class="login-card" shadow="hover">
            <el-form
                :model="form"
                ref="formRef"
                label-width="80px"
                class="login-form"
            >
                <el-form-item label="用户名">
                    <el-input
                        v-model="form.username"
                        placeholder="请输入用户名"
                        size="large"
                    />
                </el-form-item>

                <el-form-item label="密码">
                    <el-input
                        v-model="form.password"
                        type="password"
                        placeholder="请输入密码"
                        show-password
                        size="large"
                    />
                </el-form-item>

                <el-form-item>
                    <el-button
                        type="primary"
                        size="large"
                        class="login-btn"
                        @click="handleLogin"
                        :loading="loginLoading"
                    >
                        登录
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<style lang="scss" scoped>
// 全局样式变量
$primary-color: #409EFF;
$primary-light: #66b1ff;
$bg-gradient-start: #f0f4f9;
$bg-gradient-end: #e5e9f2;
$card-bg: #ffffff;
$border-radius: 12px;
$shadow-color: rgba(0, 0, 0, 0.1);
$transition: all 0.3s ease;

// 登录页面容器
.login-container {
    height: 100vh;
    display: flex;
    width: 100vw;
    justify-content: center;
    align-items: center;
    // 简洁渐变背景
    background: linear-gradient(135deg, $bg-gradient-start 0%, $bg-gradient-end 100%);
    padding: 20px;

    // 登录卡片
    .login-card {
        width: 400px;
        background-color: $card-bg;
        border-radius: $border-radius;
        box-shadow: 0 8px 24px $shadow-color;
        border: none;
        overflow: hidden;

        :deep(.el-card__body) {
            padding: 40px;
        }

        // 登录表单
        .login-form {
            .login-btn {
                width: 100%;
                height: 48px;
                border-radius: 8px;
                background-color: $primary-color;
                border: none;
                font-size: 16px;
                transition: $transition;

                &:hover {
                    background-color: $primary-light;
                }
            }

            // 输入框美化
            :deep(.el-input__wrapper) {
                border-radius: 8px;
                box-shadow: none;
                transition: $transition;

                &:hover {
                    border-color: $primary-light;
                }

                &:focus-within {
                    border-color: $primary-color;
                    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
                }
            }

            // 表单项间距
            :deep(.el-form-item) {
                margin-bottom: 20px;
            }
        }
    }

    // 响应式适配
    @media (max-width: 480px) {
        .login-card {
            width: 100%;
        }
    }
}
</style>