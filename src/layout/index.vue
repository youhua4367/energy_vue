<template>
    <el-container class="layout">
        <el-aside width="200px">
            <Sidebar />
        </el-aside>

        <el-container>
            <el-header>
                <Header />
            </el-header>

            <el-main>
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
</script>

<style scoped>
.layout {
    height: 100vh;
}
</style>
