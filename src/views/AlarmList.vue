<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { AlarmRecord } from "@/types/alarm";
import { getAlarmList, handleAlarm } from "@/api/alarm";
import { getDeviceList } from "@/api/device";
import type {Device} from "@/types/device.ts";

// ---------------------- 状态 ----------------------
const deviceList = ref<Device[]>([]);

const selectedDeviceId = ref<number | undefined>(undefined);
const alarmList = ref<AlarmRecord[]>([]);
const loading = ref(false);

// 筛选状态：0-全部 1-未处理 2-已处理
const filterStatus = ref<number>(0);
// 搜索关键词
const searchKeyword = ref("");

// ---------------------- 获取设备列表 ----------------------
const fetchDevices = async () => {
    try {
        const res = await getDeviceList();
        deviceList.value = res.data;
    } catch (e) {
        ElMessage.error("获取设备列表失败");
        console.error(e);
    }
};

// ---------------------- 获取告警列表 ----------------------
const fetchAlarms = async () => {
    loading.value = true;
    try {
        const res = selectedDeviceId.value
            ? await getAlarmList(selectedDeviceId.value)
            : await getAlarmList(null);

        // 按触发时间降序，最新的在最上面
        alarmList.value = res.data

    } catch (e) {
        ElMessage.error("获取告警列表失败");
        console.error(e);
    } finally {
        loading.value = false;
    }
};

// ---------------------- 处理告警 ----------------------
const handle = async (alarmId: number) => {
    try {
        await ElMessageBox.confirm(
            "确认要处理这条告警吗？处理后状态将变为已处理",
            "提示",
            {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }
        );

        await handleAlarm(alarmId);
        ElMessage.success("告警处理成功");
        await fetchAlarms();
    } catch (e) {
        if (e !== "cancel") {
            ElMessage.error("处理告警失败");
            console.error(e);
        }
    }
};

// ---------------------- 筛选 & 搜索 ----------------------
const filteredAlarms = computed(() => {
    return alarmList.value.filter(alarm => {
        const matchesStatus =
            filterStatus.value === 0 ||
            (filterStatus.value === 1 && alarm.status === 0) ||
            (filterStatus.value === 2 && alarm.status === 1);

        const deviceName = deviceList.value.find(d => d.id === alarm.deviceId)?.deviceName || '';
        const matchesKeyword =
            searchKeyword.value === "" ||
            alarm.alarmDesc.includes(searchKeyword.value) ||
            deviceName.includes(searchKeyword.value) ||
            alarm.alarmValue.toString().includes(searchKeyword.value);

        return matchesStatus && matchesKeyword;
    });
});

// ---------------------- 监听筛选条件变化 ----------------------
watch([filterStatus, searchKeyword], () => {});

// ---------------------- 页面初始化 ----------------------
onMounted(async () => {
    await fetchDevices();
    await fetchAlarms(); // ✅ 初始化默认加载所有设备的告警
});
</script>

<template>
    <div class="alarm-list-container">
        <el-card class="main-card" shadow="hover">
            <!-- 页面标题 -->
            <div class="page-header">
                <h2 class="page-title">告警管理中心</h2>
                <p class="page-desc">实时监控设备告警信息，最新告警优先展示</p>
            </div>

            <!-- 筛选 & 搜索工具栏 -->
            <div class="toolbar">
                <el-select
                    v-model="selectedDeviceId"
                    placeholder="选择设备（默认全部）"
                    clearable
                    @change="fetchAlarms"
                    class="device-select"
                    filterable
                >
                    <el-option
                        v-for="d in deviceList"
                        :key="d.id"
                        :label="d.deviceName"
                        :value="d.id"
                    />
                </el-select>

                <el-select
                    v-model="filterStatus"
                    placeholder="状态筛选"
                    clearable
                    class="status-select"
                >
                    <el-option :label="'全部告警'" :value="0" />
                    <el-option :label="'未处理'" :value="1" />
                    <el-option :label="'已处理'" :value="2" />
                </el-select>

                <el-input
                    v-model="searchKeyword"
                    placeholder="搜索告警描述/设备/告警值"
                    clearable
                    class="search-input"
                    @keyup.enter="fetchAlarms"
                >
                    <template #prefix>
                        <el-icon><Search /></el-icon>
                    </template>
                </el-input>

                <el-button
                    type="primary"
                    icon="Refresh"
                    @click="fetchAlarms"
                    :loading="loading"
                    class="refresh-btn"
                >
                    刷新列表
                </el-button>
            </div>

            <!-- 告警表格 -->
            <el-table
                :data="filteredAlarms"
                v-loading="loading"
                border
                style="width: 100%"
                stripe
                highlight-current-row
                empty-text="暂无告警数据"
                class="alarm-table"
            >
                <el-table-column prop="id" label="告警ID" width="80" align="center" />
                <el-table-column label="设备名称" width="180">
                    <template #default="{ row }">
                        <span class="device-name">
                            {{ deviceList.find(d => d.id === row.deviceId)?.deviceName || '未知设备' }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="告警类型" width="120" align="center">
                    <template #default="{ row }">
                        <el-tag
                            :type="row.alarmType === 1 ? 'warning' : (row.alarmType === 2 ? 'danger' : 'info')"
                            size="small"
                        >
                            <span v-if="row.alarmType === 1">电压告警</span>
                            <span v-else-if="row.alarmType === 2">电流告警</span>
                            <span v-else-if="row.alarmType === 3">功率告警</span>
                            <span v-else>未知告警</span>
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="alarmValue" label="告警值" width="120" align="center">
                    <template #default="{ row }">
                        <span class="alarm-value">{{ row.alarmValue }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="alarmDesc" label="告警描述" min-width="200" />
                <el-table-column prop="triggerTime" label="触发时间" width="200" align="center">
                    <template #default="{ row }">
                        <span class="time-text">{{ row.triggerTime }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 0 ? 'danger' : 'success'" size="small">
                            {{ row.status === 0 ? '未处理' : '已处理' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120" align="center" fixed="right">
                    <template #default="{ row }">
                        <el-button
                            v-if="row.status === 0"
                            size="small"
                            type="primary"
                            @click="handle(row.id)"
                            icon="Check"
                        >
                            处理
                        </el-button>
                        <span v-else class="handled-text">已处理</span>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 无数据提示 -->
            <div v-if="!loading && filteredAlarms.length === 0" class="empty-container">
                <el-empty description="暂无告警数据" />
            </div>
        </el-card>
    </div>
</template>

<style scoped lang="scss">
// 全局样式变量
$primary-color: #409EFF;
$danger-color: #F56C6C;
$warning-color: #E6A23C;
$success-color: #67C23A;
$info-color: #909399;
$light-bg: #f8f9fa;
$card-bg: #ffffff;
$border-color: #e6e6e6;
$text-primary: #303133;
$text-secondary: #606266;
$shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
$transition: all 0.2s ease-in-out;

.alarm-list-container {
    padding: 20px;
    background-color: $light-bg;
    min-height: 100vh;

    .main-card {
        border-radius: 12px;
        box-shadow: $shadow-light;
        border: none;
        overflow: hidden;

        :deep(.el-card__body) {
            padding: 24px;
        }

        // 页面标题
        .page-header {
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid $border-color;

            .page-title {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
                color: $text-primary;
            }

            .page-desc {
                margin: 8px 0 0 0;
                color: $text-secondary;
                font-size: 14px;
            }
        }

        // 工具栏
        .toolbar {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 20px;
            flex-wrap: wrap;

            .device-select, .status-select {
                width: 200px;

                :deep(.el-select__wrapper) {
                    border-radius: 8px;
                    transition: $transition;

                    &:hover {
                        box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2);
                    }
                }
            }

            .search-input {
                flex: 1;
                min-width: 200px;

                :deep(.el-input__wrapper) {
                    border-radius: 8px;
                    transition: $transition;

                    &:hover {
                        box-shadow: 0 0 0 1px rgba(64, 158, 255, 0.2);
                    }
                }
            }

            .refresh-btn {
                border-radius: 8px;

                :deep(.el-icon) {
                    margin-right: 6px;
                }
            }
        }

        // 告警表格
        .alarm-table {
            border-radius: 8px;
            overflow: hidden;

            :deep(.el-table__header) {
                th {
                    background-color: $light-bg;
                    color: $text-secondary;
                    font-weight: 500;
                    border-bottom: 1px solid $border-color;
                }
            }

            :deep(.el-table__row) {
                &:hover {
                    background-color: rgba(64, 158, 255, 0.04);
                }

                &:nth-child(odd) {
                    background-color: $card-bg;
                }

                &:nth-child(even) {
                    background-color: $light-bg;
                }
            }

            :deep(.el-table__cell) {
                padding: 12px 0;
                border-bottom: 1px solid $border-color;
            }

            .device-name {
                font-weight: 500;
                color: $text-primary;
            }

            .alarm-value {
                font-weight: 600;
                color: $danger-color;
            }

            .time-text {
                font-size: 12px;
                color: $text-secondary;
            }

            .handled-text {
                color: $info-color;
                font-size: 12px;
            }
        }

        // 空数据容器
        .empty-container {
            padding: 60px 0;
            text-align: center;

            :deep(.el-empty) {
                --el-empty-text-color: $text-secondary;
            }
        }
    }
}
</style>