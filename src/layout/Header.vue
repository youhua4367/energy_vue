<template>
    <div class="header">
        <div class="title">智慧校园能耗监测与管理平台</div>

        <div class="user">
            <span>欢迎，{{ username }}</span>
            <el-button type="text" @click="logout">退出</el-button>
        </div>
    </div>
</template>

<script setup>
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const username = userStore.username

const logout = () => {
    userStore.logout()
    router.push('/login')
}
</script>

<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
