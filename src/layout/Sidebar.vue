<template>
    <el-menu
        router
        :default-active="$route.path"
        class="el-menu-vertical"
    >
        <el-menu-item index="/dashboard">
            仪表盘
        </el-menu-item>

        <el-menu-item index="/buildings">
            建筑管理
        </el-menu-item>

        <el-menu-item index="/devices">
            设备管理
        </el-menu-item>

        <el-menu-item index="/energy">
            实时数据
        </el-menu-item>

        <el-menu-item index="/statistics">
            能耗统计
        </el-menu-item>

        <el-menu-item index="/alerts">
            告警记录
        </el-menu-item>

        <!-- 仅管理员显示 -->
        <el-menu-item
            v-if="isAdmin"
            index="/users"
        >
            用户管理
        </el-menu-item>
    </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.role === 'ADMIN')
</script>
