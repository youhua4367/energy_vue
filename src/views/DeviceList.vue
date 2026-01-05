<script setup lang="ts">
import { ref, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus" // 导入消息和确认框
import type { Device } from "@/types/device"
import { getDeviceList, addDevice, updateDevice, deleteDevice } from "@/api/device"

// 表格数据
const deviceList = ref<Device[]>([])
const loading = ref(false)

// 查询字段
const queryDeviceName = ref("")
const querySN = ref("")
const queryBuildingId = ref("")
const queryRoomNo = ref("")

// 表单弹窗控制
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentDevice = ref<Partial<Device>>({})
const saveLoading = ref(false) // 保存按钮loading状态

// 状态映射
const statusMap: Record<number, string> = {
    0: "未使用",
    1: "使用中",
    2: "禁用"
}

// 获取设备列表
const getDevice = async () => {
    loading.value = true
    try {
        let res = await getDeviceList()
        deviceList.value = res.data.filter(device => {
            return (!queryDeviceName.value || device.deviceName.includes(queryDeviceName.value))
                && (!querySN.value || device.sn.includes(querySN.value))
                && (!queryBuildingId.value || device.buildingId.includes(queryBuildingId.value))
                && (!queryRoomNo.value || device.roomNo.includes(queryRoomNo.value))
        })
    } catch (error) {
        ElMessage.error("获取设备列表失败")
        console.error("Get device list error:", error)
    } finally {
        loading.value = false
    }
}

// 打开新增弹窗
const handleAdd = () => {
    isEdit.value = false
    currentDevice.value = {
        status: 0 // 默认未使用状态
    }
    dialogVisible.value = true
}

// 打开编辑弹窗
const handleEdit = (device: Device) => {
    isEdit.value = true
    currentDevice.value = { ...device }
    dialogVisible.value = true
}

// 保存设备（新增或更新）
const handleSave = async () => {
    // 简单表单验证
    if (!currentDevice.value.deviceName) {
        ElMessage.warning("请输入设备名称")
        return
    }
    if (!currentDevice.value.sn) {
        ElMessage.warning("请输入设备SN")
        return
    }

    saveLoading.value = true
    try {
        if (isEdit.value) {
            await updateDevice(currentDevice.value as Device)
            ElMessage.success("设备编辑成功")
        } else {
            await addDevice(currentDevice.value as Device)
            ElMessage.success("设备新增成功")
        }
        dialogVisible.value = false
        await getDevice()
        console.log(deviceList.value)
    } catch (error) {
        ElMessage.error(isEdit.value ? "设备编辑失败" : "设备新增失败")
        console.error("Save device error:", error)
    } finally {
        saveLoading.value = false
    }
}

// 删除设备（添加确认框）
const handleDelete = async (id: number) => {
    try {
        await ElMessageBox.confirm(
            "此操作将永久删除该设备, 是否继续?",
            "提示",
            {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }
        )
        console.log(id)
        console.log(id)
        console.log(id)
        await deleteDevice(id)
        ElMessage.success("设备删除成功")
        await getDevice()
    } catch (error) {
        if (error !== "cancel") { // 排除取消操作的错误
            ElMessage.error("设备删除失败")
            console.error("Delete device error:", error)
        }
    }
}

// 页面加载时获取列表
onMounted(async () =>{
    await getDevice()
})
</script>

<template>
    <el-card class="device-card" shadow="hover">
        <!-- 查询表单 -->
        <div class="card-header">
            <h2 class="card-title">设备管理</h2>
            <el-form :inline="true" class="filter-form" size="default">
                <el-form-item label="设备名称" prop="deviceName">
                    <el-input
                        v-model="queryDeviceName"
                        placeholder="请输入设备名称"
                        clearable
                        class="filter-input"
                        @keyup.enter="getDevice"
                    />
                </el-form-item>
                <el-form-item label="设备SN" prop="sn">
                    <el-input
                        v-model="querySN"
                        placeholder="请输入设备SN"
                        clearable
                        class="filter-input"
                        @keyup.enter="getDevice"
                    />
                </el-form-item>
                <el-form-item label="房间号" prop="roomNo">
                    <el-input
                        v-model="queryRoomNo"
                        placeholder="请输入房间号"
                        clearable
                        class="filter-input"
                        @keyup.enter="getDevice"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="Search" @click="getDevice">查询</el-button>
                    <el-button icon="Refresh" @click="
                        queryDeviceName=''; querySN=''; queryBuildingId=''; queryRoomNo='';
                        getDevice();
                    ">重置</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="success" icon="Plus" @click="handleAdd">新增设备</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 设备表格 -->
        <el-table
            :data="deviceList"
            border
            style="width: 100%"
            :loading="loading"
            stripe
            highlight-current-row
            class="device-table"
            empty-text="暂无设备数据"
        >
            <el-table-column prop="deviceName" label="设备名称" min-width="180" />
            <el-table-column prop="sn" label="设备SN" min-width="200" />
            <el-table-column prop="buildingId" label="所属建筑" min-width="120" />
            <el-table-column prop="roomNo" label="房间号" min-width="100" />
            <el-table-column prop="maxPower" label="额定功率(W)" width="120" align="center" />
            <el-table-column label="状态" width="120" align="center">
                <template #default="{ row }">
                    <el-tag
                        :type="row.status === 1 ? 'success' : (row.status === 2 ? 'danger' : 'info')"
                        size="small"
                        class="status-tag"
                    >
                        {{ statusMap[row.status] }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                    <el-button
                        type="primary"
                        link
                        size="small"
                        icon="Edit"
                        @click="handleEdit(row)"
                        class="edit-btn"
                    >
                        编辑
                    </el-button>
                    <el-button
                        type="danger"
                        link
                        size="small"
                        icon="Delete"
                        @click="handleDelete(row.id)"
                        class="delete-btn"
                    >
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 弹窗表单 -->
        <el-dialog
            :title="isEdit ? '编辑设备' : '新增设备'"
            v-model="dialogVisible"
            width="500px"
            :close-on-click-modal="false"
            :destroy-on-close="true"
        >
            <el-form
                :model="currentDevice"
                class="device-form"
                label-width="100px"
            >
                <el-form-item label="设备名称" prop="deviceName">
                    <el-input
                        v-model="currentDevice.deviceName"
                        placeholder="请输入设备名称"
                        maxlength="50"
                        show-word-limit
                    />
                </el-form-item>
                <el-form-item label="设备SN" prop="sn">
                    <el-input
                        v-model="currentDevice.sn"
                        placeholder="请输入设备SN"
                        maxlength="30"
                        show-word-limit
                    />
                </el-form-item>
                <el-form-item label="所属建筑" prop="buildingId">
                    <el-input
                        v-model="currentDevice.buildingId"
                        placeholder="请输入建筑ID"
                        maxlength="20"
                        show-word-limit
                    />
                </el-form-item>
                <el-form-item label="房间号" prop="roomNo">
                    <el-input
                        v-model="currentDevice.roomNo"
                        placeholder="请输入房间号"
                        maxlength="20"
                        show-word-limit
                    />
                </el-form-item>
                <el-form-item label="额定功率(W)" prop="maxPower">
                    <el-input
                        v-model.number="currentDevice.maxPower"
                        type="number"
                        placeholder="请输入额定功率"
                        min="0"
                        step="1"
                    />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select
                        v-model.number="currentDevice.status"
                        placeholder="请选择设备状态"
                        style="width: 100%"
                    >
                        <el-option
                            v-for="(label, value) in statusMap"
                            :key="value"
                            :label="label"
                            :value="value"
                        />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible=false">取消</el-button>
                <el-button
                    type="primary"
                    @click="handleSave"
                    :loading="saveLoading"
                >
                    保存
                </el-button>
            </template>
        </el-dialog>
    </el-card>
</template>

<style scoped lang="scss">
// 全局样式变量
$primary-color: #409EFF;
$success-color: #67C23A;
$danger-color: #F56C6C;
$info-color: #909399;
$light-bg: #f8f9fa;
$border-color: #e6e6e6;
$card-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
$transition: all 0.2s ease-in-out;

// 卡片容器
.device-card {
    border-radius: 8px;
    box-shadow: $card-shadow;
    border: none;
    overflow: hidden;

    :deep(.el-card__body) {
        padding: 0;
    }

    // 卡片头部
    .card-header {
        padding: 20px 20px 10px;
        border-bottom: 1px solid $border-color;

        .card-title {
            font-size: 18px;
            font-weight: 600;
            color: #303133;
            margin: 0 0 16px 0;
        }

        // 筛选表单
        .filter-form {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px 0;

            .filter-input {
                width: 180px;

                :deep(.el-input__wrapper) {
                    border-radius: 6px;
                    transition: $transition;

                    &:hover {
                        box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2);
                    }
                }
            }

            :deep(.el-form-item) {
                margin-bottom: 10px;
            }

            :deep(.el-button) {
                border-radius: 6px;
            }
        }
    }

    // 设备表格
    .device-table {
        margin: 16px 20px 20px;
        border-radius: 8px;
        overflow: hidden;

        :deep(.el-table__header) {
            th {
                background-color: $light-bg;
                color: #606266;
                font-weight: 500;

                &:hover {
                    background-color: $light-bg;
                }
            }
        }

        :deep(.el-table__row) {
            &:hover {
                background-color: rgba(64, 158, 255, 0.04);
            }
        }

        :deep(.el-table__cell) {
            padding: 12px 0;
            border-bottom: 1px solid $border-color;
        }

        // 状态标签
        .status-tag {
            border-radius: 4px;
        }

        // 操作按钮
        .edit-btn {
            color: $primary-color;

            &:hover {
                color: #66b1ff;
            }
        }

        .delete-btn {
            color: $danger-color;

            &:hover {
                color: #f78989;
            }
        }
    }

    // 表单样式
    .device-form {
        :deep(.el-form-item) {
            margin-bottom: 20px;

            :deep(.el-input__wrapper) {
                border-radius: 6px;
            }
        }
    }
}
</style>