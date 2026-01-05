<script setup lang="ts">
import { ref, onMounted } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import type { Building } from "@/types/building"
import { getBuildingList, addBuilding, updateBuilding, deleteBuilding } from "@/api/building.ts"

// 表格数据
const buildingList = ref<Building[]>([])
const loading = ref(false)

// 查询字段
const queryName = ref("")
const queryLocation = ref("")
const queryUsageType = ref("")

// 弹窗控制
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentBuilding = ref<Partial<Building>>({})
const saveLoading = ref(false)

// 获取建筑列表
const getBuilding = async () => {
    loading.value = true
    try {
        const res = await getBuildingList()
        buildingList.value = res.data.filter(b => {
            return (!queryName.value || b.name.includes(queryName.value))
                && (!queryLocation.value || (b.locationCode ?? "").includes(queryLocation.value))
                && (!queryUsageType.value || (b.usageType ?? "").includes(queryUsageType.value))
        })
    } catch (error) {
        ElMessage.error("获取建筑列表失败")
        console.error("Get building list error:", error)
    } finally {
        loading.value = false
    }
}

// 打开新增弹窗
const handleAdd = () => {
    isEdit.value = false
    currentBuilding.value = {}
    dialogVisible.value = true
}

// 打开编辑弹窗
const handleEdit = (building: Building) => {
    isEdit.value = true
    currentBuilding.value = { ...building }
    dialogVisible.value = true
}

// 保存建筑（新增或更新）
const handleSave = async () => {
    if (!currentBuilding.value.name) {
        ElMessage.warning("请输入建筑名称")
        return
    }

    saveLoading.value = true
    try {
        if (isEdit.value) {
            await updateBuilding(currentBuilding.value as Building)
            ElMessage.success("建筑编辑成功")
        } else {
            await addBuilding(currentBuilding.value as Building)
            ElMessage.success("建筑新增成功")
        }
        dialogVisible.value = false
        await getBuilding()
    } catch (error) {
        ElMessage.error(isEdit.value ? "建筑编辑失败" : "建筑新增失败")
        console.error("Save building error:", error)
    } finally {
        saveLoading.value = false
    }
}

// 删除建筑
const handleDelete = async (id: number) => {
    try {
        await ElMessageBox.confirm(
            "此操作将永久删除该建筑, 是否继续?",
            "提示",
            {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }
        )
        await deleteBuilding(id)
        ElMessage.success("建筑删除成功")
        await getBuilding()
    } catch (error) {
        if (error !== "cancel") {
            ElMessage.error("建筑删除失败")
            console.error("Delete building error:", error)
        }
    }
}

// 页面加载时获取列表
onMounted(async () => {
    await getBuilding()
})
</script>

<template>
    <el-card class="building-card" shadow="hover">
        <!-- 查询表单 -->
        <div class="card-header">
            <h2 class="card-title">建筑管理</h2>
            <el-form :inline="true" class="filter-form" size="default">
                <el-form-item label="建筑名称">
                    <el-input
                        v-model="queryName"
                        placeholder="请输入建筑名称"
                        clearable
                        class="filter-input"
                        @keyup.enter="getBuilding"
                    />
                </el-form-item>
                <el-form-item label="位置编号">
                    <el-input
                        v-model="queryLocation"
                        placeholder="请输入位置编号"
                        clearable
                        class="filter-input"
                        @keyup.enter="getBuilding"
                    />
                </el-form-item>
                <el-form-item label="用途类型">
                    <el-input
                        v-model="queryUsageType"
                        placeholder="请输入用途类型"
                        clearable
                        class="filter-input"
                        @keyup.enter="getBuilding"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" icon="Search" @click="getBuilding">查询</el-button>
                    <el-button icon="Refresh" @click="
                    queryName=''; queryLocation=''; queryUsageType='';
                    getBuilding();
                ">重置</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="success" icon="Plus" @click="handleAdd">新增建筑</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 建筑表格 -->
        <el-table
            :data="buildingList"
            border
            style="width: 100%"
            :loading="loading"
            stripe
            highlight-current-row
            class="building-table"
            empty-text="暂无建筑数据"
        >
            <el-table-column prop="name" label="建筑名称" min-width="180" />
            <el-table-column prop="locationCode" label="位置编号" min-width="120" />
            <el-table-column prop="floorCount" label="楼层数" width="100" align="center"/>
            <el-table-column prop="usageType" label="用途类型" width="120" />
            <el-table-column prop="createTime" label="创建时间" min-width="180" />
            <el-table-column label="操作" width="180" fixed="right">
                <template #default="{ row }">
                    <el-button
                        type="primary"
                        link
                        size="small"
                        icon="Edit"
                        @click="handleEdit(row)"
                    >
                        编辑
                    </el-button>
                    <el-button
                        type="danger"
                        link
                        size="small"
                        icon="Delete"
                        @click="handleDelete(row.id)"
                    >
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 弹窗表单 -->
        <el-dialog
            :title="isEdit ? '编辑建筑' : '新增建筑'"
            v-model="dialogVisible"
            width="500px"
            :close-on-click-modal="false"
            :destroy-on-close="true"
        >
            <el-form :model="currentBuilding" label-width="100px" class="building-form">
                <el-form-item label="建筑名称" prop="name">
                    <el-input v-model="currentBuilding.name" placeholder="请输入建筑名称" />
                </el-form-item>
                <el-form-item label="位置编号" prop="locationCode">
                    <el-input v-model="currentBuilding.locationCode" placeholder="请输入位置编号" />
                </el-form-item>
                <el-form-item label="楼层数" prop="floorCount">
                    <el-input-number v-model.number="currentBuilding.floorCount" placeholder="请输入楼层数" min="0" style="width: 100%;" />
                </el-form-item>
                <el-form-item label="用途类型" prop="usageType">
                    <el-input v-model="currentBuilding.usageType" placeholder="请输入用途类型" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible=false">取消</el-button>
                <el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
            </template>
        </el-dialog>
    </el-card>
</template>

<style scoped lang="scss">
$primary-color: #409EFF;
$success-color: #67C23A;
$danger-color: #F56C6C;
$info-color: #909399;
$light-bg: #f8f9fa;
$border-color: #e6e6e6;
$card-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
$transition: all 0.2s ease-in-out;

.building-card {
    border-radius: 8px;
    box-shadow: $card-shadow;
    border: none;
    overflow: hidden;

    :deep(.el-card__body) { padding: 0; }

    .card-header {
        padding: 20px 20px 10px;
        border-bottom: 1px solid $border-color;

        .card-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; }

        .filter-form {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 8px 0;

            .filter-input { width: 180px; }

            :deep(.el-form-item) { margin-bottom: 10px; }
        }
    }

    .building-table {
        margin: 16px 20px 20px;
        border-radius: 8px;
        overflow: hidden;

        :deep(.el-table__header th) {
            background-color: $light-bg;
            color: #606266;
            font-weight: 500;
        }

        :deep(.el-table__row:hover) { background-color: rgba(64,158,255,0.04); }
        :deep(.el-table__cell) { padding: 12px 0; border-bottom: 1px solid $border-color; }
    }

    .building-form :deep(.el-form-item) { margin-bottom: 20px; }
}
</style>
