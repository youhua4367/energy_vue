<script setup lang="ts">
import { onMounted, ref } from "vue"
import { getDeviceList } from "@/api/user/device.ts"
import type { Device } from "@/types/device"

const deviceList = ref<Device[]>([])

onMounted(async () => {
    deviceList.value = (await getDeviceList()).data
    console.log(deviceList.value)
})
</script>

<template>
    <el-card>
        <el-table :data="deviceList" border style="width: 100%">
            <el-table-column prop="deviceName" label="设备名称" />
            <el-table-column prop="sn" label="设备SN" />
            <el-table-column prop="buildingId" label="所属建筑" />
            <el-table-column prop="roomNo" label="房间号" />
            <el-table-column prop="maxPower" label="额定功率(W)" />

            <el-table-column label="状态">
                <template #default="{ row }">
                    <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                        {{ row.status }}
                    </el-tag>
                </template>
            </el-table-column>

            <el-table-column label="操作" width="120">
                <el-button type="primary" link>详情</el-button>
            </el-table-column>
        </el-table>
    </el-card>
</template>

