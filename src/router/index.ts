import {createRouter, createWebHistory} from "vue-router";
import type {RouteRecordRaw} from "vue-router";

const routes: RouteRecordRaw[] = [
    {path: "/login", name: "Login", component: () => import("@/views/Login.vue"), meta: {title: "登录"}},
    {path: "/", component: ()=> import("@/layout/MainLayout.vue"), redirect: "/dashboard", children: [
        {path: "dashboard", name: "Dashboard", component: () => import("@/views/Dashboard.vue"), meta: {title: "系统总览", icon: "DataBoard"}},
        {path: "buildings", name: "Building", component: () => import("@/views/BuildingList.vue"), meta: {title: "建筑管理", icon: "OfficeBuilding"}},
        {path: "devices", name: "Device", component: () => import("@/views/DeviceList.vue"), meta: {title: "设备管理", icon: "Cpu"}},
        {path: "energy", name: "EnergyRealtime", component: () => import("@/views/EnergyRealtime.vue"), meta: {title: "实时能耗", icon: "Lightning"}},
        {path: "alarms", name: "Alarm", component: () => import("@/views/AlarmList.vue"), meta: {title: "告警记录", icon: "Warning"}},
        {path: "stats", name: "EnergyStats", component: () => import("@/views/EnergyStats.vue"), meta: {title: "统计分析", icon: "PieChart"}}
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem("token")
    
    if (to.path === "/login") {
        next()
        return
    }
    
    if (!token) {
        next("/login")
    } else {
        next()
    }
})


export default router