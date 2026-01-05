<script setup lang="ts">
import { useRouter } from "vue-router"
import {useTokenStore} from "@/store/token.ts";
import {ElMessage} from "element-plus";

const tokenStore = useTokenStore();
const router = useRouter()

// 取 layout 下的子路由
const menuRoutes = (
    router.options.routes.find(r => r.path === "/")?.children || []
).filter(route => {
    const roles = route.meta?.roles
    if (!roles) return true
    return roles.includes(tokenStore.role)
})
// 退出登录
const handleLogout = () => {
    tokenStore.removeToken()
    ElMessage.success("退出登录成功！")
    router.push("/login")
}
</script>

<template>
    <el-container class="layout-container">
        <!-- 侧边栏 -->
        <el-aside width="200px" class="layout-aside">
            <div class="logo-container">
                <div class="logo-text">智慧校园能耗平台</div>
            </div>
            <el-menu
                router
                :default-active="$route.path"
                class="main-menu"
                background-color="#001529"
                text-color="#fff"
                active-text-color="#409EFF"
                unique-opened
            >
                <el-menu-item
                    v-for="route in menuRoutes"
                    :key="route.path"
                    :index="route.path.startsWith('/') ? route.path : '/' + route.path"
                    class="menu-item"
                >
                    <el-icon class="menu-icon">
                        <Menu />
                    </el-icon>
                    <span class="menu-label">{{ route.meta?.title }}</span>
                </el-menu-item>
            </el-menu>
        </el-aside>

        <!-- 主内容区 -->
        <el-container class="main-container">
            <el-header class="page-header">
                <div class="header-content">
                    <el-icon class="toggle-icon">
                        <Menu />
                    </el-icon>
                    <div class="welcome-text">欢迎使用智慧校园能耗平台</div>
                    <div class="user-info">
                        <el-icon class="avatar-icon">
                            <User />
                        </el-icon>
                        <span class="username">管理员</span>

                        <el-button
                            type="danger"
                            size="small"
                            plain
                            @click="handleLogout"
                        >
                            退出登录
                        </el-button>
                        <el-dropdown>
                            <el-icon class="dropdown-icon">
                                <ArrowDown />
                            </el-icon>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item>个人中心</el-dropdown-item>
                                    <el-dropdown-item>退出登录</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </div>
            </el-header>
            <el-main class="page-main">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<style lang="scss" scoped>
// 全局变量定义
$primary-color: #409EFF;
$sidebar-bg: #001529;
$header-bg: #ffffff;
$main-bg: #f5f7fa;
$text-color: #303133;
$light-text: #909399;
$border-color: #e6e6e6;
$hover-color: #0960bd;
$transition: all 0.3s ease;

// 布局容器
.layout-container {
    height: 100vh;
    width: 100vw;
    overflow: hidden;

    // 侧边栏样式
    .layout-aside {
        background-color: $sidebar-bg;
        transition: $transition;

        // 品牌logo
        .logo-container {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);

            .logo-text {
                color: #ffffff;
                font-weight: 600;
                font-size: 16px;
                letter-spacing: 1px;
            }
        }

        // 主菜单
        .main-menu {
            border-right: none;
            height: calc(100vh - 60px);

            .menu-item {
                &:hover {
                    background-color: $hover-color !important;
                }

                .menu-icon {
                    margin-right: 8px;
                }

                .menu-label {
                    font-size: 14px;
                }
            }

            // 激活菜单项样式
            :deep(.is-active) {
                background-color: $hover-color !important;
            }
        }
    }

    // 主内容容器
    .main-container {
        flex: 1;

        // 页面头部
        .page-header {
            background-color: $header-bg;
            padding: 0 20px;
            border-bottom: 1px solid $border-color;
            height: 60px;
            line-height: 60px;

            .header-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 100%;

                .toggle-icon {
                    font-size: 20px;
                    color: $text-color;
                    cursor: pointer;
                    margin-right: 20px;
                }

                .welcome-text {
                    font-size: 16px;
                    color: $text-color;
                    font-weight: 500;
                }

                .user-info {
                    display: flex;
                    align-items: center;

                    .avatar-icon {
                        font-size: 20px;
                        color: $primary-color;
                        margin-right: 8px;
                    }

                    .username {
                        color: $text-color;
                        margin-right: 8px;
                    }

                    .dropdown-icon {
                        color: $light-text;
                        cursor: pointer;
                    }
                }
            }
        }

        // 页面主体
        .page-main {
            background-color: $main-bg;
            padding: 20px;
            height: calc(100vh - 60px);
            overflow-y: auto;

            // 自定义滚动条
            &::-webkit-scrollbar {
                width: 6px;
                height: 6px;
            }

            &::-webkit-scrollbar-thumb {
                background-color: rgba(0, 0, 0, 0.1);
                border-radius: 3px;
            }

            &::-webkit-scrollbar-track {
                background-color: transparent;
            }
        }
    }
}

// 响应式适配
@media (max-width: 768px) {
    .layout-container {
        .layout-aside {
            width: 60px !important;

            .logo-text {
                display: none;
            }

            .menu-label {
                display: none;
            }

            .menu-icon {
                margin-right: 0;
            }
        }
    }
}
</style>