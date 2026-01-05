import {defineStore} from "pinia";
import {ref} from "vue";


export const useTokenStore = defineStore("token", () => {
    const token = ref("")
    const role = ref(0)  // 1管理员，2用户
    
    const setToken = (newToken: string, newRole: number) => {
        token.value = newToken
        role.value = newRole
    }
    
    const removeToken = () => {
        token.value = ""
        role.value = 0
    }
    
    return {
        token,
        role,
        setToken,
        removeToken
    }
}, {
    persist: true
})
