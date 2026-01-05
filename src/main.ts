import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {createPinia} from "pinia";
import {createPersistedState} from "pinia-plugin-persistedstate";
import router from "@/router";
import ElementPlus from "element-plus";

import 'element-plus/dist/index.css'
import "@/assets/global.css"

const app = createApp(App)
const pinia = createPinia()
const persist = createPersistedState()
pinia.use(persist)
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
