import axios from "axios";
import {ElMessage} from "element-plus";

import router from "@/router";
import {useTokenStore} from "@/store/token.ts"

const baseURL  = import.meta.env.VITE_BASE_URL || '/api'

const instance = axios.create({
    timeout: 10000,
    baseURL: baseURL
});

// 请求拦截器
instance.interceptors.request.use(
    (config) => {
        const tokenStore = useTokenStore()
        console.log(tokenStore.token)
        if (tokenStore.token) {
            config.headers.Authorization = `Bearer ${tokenStore.token}`
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

// 响应拦截器
instance.interceptors.response.use(
    result => {
        if (result.data.code === 1) {
            return result.data;
        }
        ElMessage.error(result.data.message ? result.data.message : '服务异常');
        return Promise.reject(result.data);
    },
    (error) => {
        if (error.response?.status === 401) {
            ElMessage.error("请先登录")
            const tokenStore = useTokenStore()
            tokenStore.removeToken()
            router.push("/login")
        } else {
            ElMessage.error("服务异常")
        }
        return Promise.reject(error);
    }
)

export default instance;