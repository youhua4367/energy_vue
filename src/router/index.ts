import {createRouter, createWebHistory} from "vue-router";
import type {RouteRecordRaw} from "vue-router";
import {useTokenStore} from "@/store/token.ts";

const routes: RouteRecordRaw[] = [
    {path: "/login", name: "Login", component: () => import("@/views/Login.vue"), meta: {title: "登录"}},
    {path: "/", component: ()=> import("@/layout/MainLayout.vue"), redirect: "/dashboard", children: [
        {path: "dashboard", name: "Dashboard", component: () => import("@/views/Dashboard.vue"), meta: {title: "系统总览", icon: "DataBoard", roles: [1, 2]}},
        {path: "buildings", name: "Building", component: () => import("@/views/BuildingList.vue"), meta: {title: "建筑管理", icon: "OfficeBuilding", roles: [1]}},
        {path: "devices", name: "Device", component: () => import("@/views/DeviceList.vue"), meta: {title: "设备管理", icon: "Cpu", roles: [1]}},
        {path: "energy", name: "EnergyRealtime", component: () => import("@/views/EnergyRealtime.vue"), meta: {title: "实时能耗", icon: "Lightning", roles: [1, 2]}},
        {path: "alarms", name: "Alarm", component: () => import("@/views/AlarmList.vue"), meta: {title: "告警记录", icon: "Warning", roles: [1]}},
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes: routes,
})

router.beforeEach((to) => {
    const tokenStore = useTokenStore();
    
    if (to.path === "/login") return true;
    
    if (!tokenStore.token) {
        return "/login";
    }
    
    return true;
});




export default router