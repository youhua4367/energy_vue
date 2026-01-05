<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import { getDeviceList } from "@/api/device";
import { getEnergyRealtime, getEnergyStatistics } from "@/api/energy";
import type { Device } from "@/types/device";
import type { EnergyRealtime, EnergyStatistics } from "@/types/energy";

import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    DataZoomComponent
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
    LineChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    DataZoomComponent,
    CanvasRenderer
]);

// 状态
const deviceList = ref<Device[]>([]);
const selectedDeviceId = ref<number | null>(null);
const realtimeData = ref<EnergyRealtime | null>(null);
const historyData = ref<EnergyStatistics[]>([]);
const loading = ref(false);
const chartLoading = ref(false);
let chartInstance: echarts.ECharts | null = null;

// 获取设备列表
const fetchDevices = async () => {
    try {
        const res = await getDeviceList();
        deviceList.value = res.data;
    } catch (e) {
        ElMessage.error("获取设备列表失败");
        console.error(e);
    }
};

// 获取实时数据
const fetchRealtime = async () => {
    if (!selectedDeviceId.value) return;
    loading.value = true;
    try {
        const res = await getEnergyRealtime(selectedDeviceId.value);
        realtimeData.value = res.data;
    } catch (e) {
        ElMessage.error("获取实时数据失败");
        console.error(e);
    } finally {
        loading.value = false;
    }
};

// 获取历史数据
const fetchHistory = async () => {
    if (!selectedDeviceId.value) return;
    chartLoading.value = true;
    try {
        const res = await getEnergyStatistics(selectedDeviceId.value!, "day");
        historyData.value = res.data.slice(-10);
        await nextTick();
        drawChart();
    } catch (e) {
        ElMessage.error("获取历史功率数据失败");
        console.error(e);
    } finally {
        chartLoading.value = false;
    }
};

// 绘制折线图
const drawChart = () => {
    const chartDom = document.getElementById("power-chart");
    if (!chartDom) return;

    if (chartDom.offsetHeight === 0 || chartDom.offsetWidth === 0) {
        setTimeout(drawChart, 100);
        return;
    }

    if (!chartInstance) {
        chartInstance = echarts.init(chartDom);
        window.addEventListener("resize", () => chartInstance?.resize());
    }

    if (!historyData.value || historyData.value.length === 0) {
        chartInstance.clear();
        return;
    }

    chartInstance.setOption({
        title: { text: "设备功率变化趋势", left: "center" },
        tooltip: { trigger: "axis" },
        xAxis: {
            type: "category",
            data: historyData.value.map(d => d.time),
            axisLine: { lineStyle: { color: '#e6e6e6' } },
            axisLabel: { color: '#606266', fontSize: 12 }
        },
        yAxis: {
            type: "value",
            name: "功率 (W)",
            axisLine: { lineStyle: { color: '#e6e6e6' } },
            axisLabel: { color: '#606266', fontSize: 12 },
            splitLine: { lineStyle: { color: '#f5f5f5' } }
        },
        series: [
            {
                name: "功率(W)",
                type: "line",
                smooth: true,
                data: historyData.value.map(d => d.energy),
                lineStyle: { width: 2, color: '#409EFF' },
                itemStyle: { color: '#409EFF' },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                        { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
                    ])
                }
            }
        ],
        grid: { left: '4%', right: '4%', bottom: '10%', top: '15%', containLabel: true },
        dataZoom: [
            { type: 'inside', start: 0, end: 100 },
            { type: 'slider', bottom: 0, start: 0, end: 100 }
        ]
    });
};

// 监听设备变化
watch(selectedDeviceId, async (newId) => {
    if (newId) {
        await fetchRealtime();
        await fetchHistory();
    } else {
        realtimeData.value = null;
        historyData.value = [];
        if (chartInstance) chartInstance.clear();
    }
});

// 页面加载
onMounted(async () => {
    await fetchDevices();
});

// 页面销毁
onUnmounted(() => {
    if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
    }
    window.removeEventListener("resize", () => chartInstance?.resize());
});
</script>

<template>
    <div class="energy-monitor-container">
        <el-card class="main-card" shadow="hover">
            <!-- 页面标题 -->
            <div class="page-header">
                <h2 class="page-title">能耗监控中心</h2>
                <p class="page-desc">实时监控设备能耗数据，分析功率变化趋势</p>
            </div>

            <!-- 选择设备 & 手动刷新 -->
            <div class="device-selector">
                <el-select
                    v-model="selectedDeviceId"
                    placeholder="请选择监控设备"
                    class="device-select"
                    clearable
                    filterable
                >
                    <el-option
                        v-for="d in deviceList"
                        :key="d.id"
                        :label="d.deviceName"
                        :value="d.id"
                    />
                </el-select>
                <el-button
                    type="primary"
                    @click="fetchRealtime"
                    :loading="loading"
                    icon="Refresh"
                    class="refresh-btn"
                >
                    刷新实时数据
                </el-button>
            </div>

            <!-- 实时数据展示 -->
            <div v-show="!!selectedDeviceId" class="realtime-data-section">
                <h3 class="section-title">实时能耗数据</h3>

                <!-- 骨架屏加载 -->
                <el-skeleton
                    v-if="loading"
                    :rows="4"
                    animated
                    class="skeleton-loading"
                />

                <!-- 数据卡片 -->
                <el-row :gutter="20" v-else>
                    <el-col :xs="12" :sm="6" :md="6" :lg="6">
                        <el-card class="data-card voltage-card">
                            <el-statistic
                                title="电压"
                                :value="realtimeData?.voltage || 0"
                                suffix="V"
                                value-style="font-size: 24px; font-weight: 600;"
                            />
                        </el-card>
                    </el-col>
                    <el-col :xs="12" :sm="6" :md="6" :lg="6">
                        <el-card class="data-card current-card">
                            <el-statistic
                                title="电流"
                                :value="realtimeData?.current || 0"
                                suffix="A"
                                value-style="font-size: 24px; font-weight: 600;"
                            />
                        </el-card>
                    </el-col>
                    <el-col :xs="12" :sm="6" :md="6" :lg="6">
                        <el-card class="data-card power-card">
                            <el-statistic
                                title="功率"
                                :value="realtimeData?.power || 0"
                                suffix="W"
                                value-style="font-size: 24px; font-weight: 600; color: #409EFF;"
                            />
                        </el-card>
                    </el-col>
                    <el-col :xs="12" :sm="6" :md="6" :lg="6">
                        <el-card class="data-card energy-card">
                            <el-statistic
                                title="累计用电"
                                :value="realtimeData?.totalEnergy || 0"
                                suffix="kWh"
                                value-style="font-size: 24px; font-weight: 600;"
                            />
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <!-- 无数据提示 -->
            <div v-show="!selectedDeviceId" class="empty-tip">
                <el-empty description="请选择设备查看能耗数据" />
            </div>

            <!-- 历史功率折线图 -->
            <div class="chart-section" v-show="!!selectedDeviceId">
                <h3 class="section-title">历史功率变化趋势</h3>

                <!-- 图表加载状态 -->
                <div v-if="chartLoading" class="chart-loading">
                    <el-skeleton :rows="1" height="300px" animated />
                </div>

                <!-- 图表容器 -->
                <div id="power-chart" class="chart-container" />

                <!-- 无历史数据提示 -->
                <div v-if="!chartLoading && historyData.length === 0" class="chart-empty">
                    <el-empty description="暂无历史功率数据" />
                </div>
            </div>
        </el-card>
    </div>
</template>

<style scoped lang="scss">
// 全局样式变量
$primary-color: #409EFF;
$success-color: #67C23A;
$warning-color: #E6A23C;
$danger-color: #F56C6C;
$light-bg: #f8f9fa;
$card-bg: #ffffff;
$border-color: #e6e6e6;
$text-primary: #303133;
$text-secondary: #606266;
$text-placeholder: #909399;
$shadow-light: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
$transition: all 0.2s ease-in-out;

// 容器样式
.energy-monitor-container {
    padding: 20px;
    background-color: $light-bg;
    min-height: calc(100vh - 40px);

    // 主卡片
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
                font-size: 20px;
                font-weight: 600;
                color: $text-primary;
                margin: 0 0 8px 0;
            }

            .page-desc {
                font-size: 14px;
                color: $text-secondary;
                margin: 0;
            }
        }

        // 设备选择器
        .device-selector {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 32px;

            .device-select {
                width: 240px;

                :deep(.el-select__wrapper) {
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

            @media (max-width: 768px) {
                flex-direction: column;
                align-items: stretch;

                .device-select {
                    width: 100%;
                }
            }
        }

        // 实时数据区域
        .realtime-data-section {
            margin-bottom: 32px;

            .section-title {
                font-size: 16px;
                font-weight: 500;
                color: $text-primary;
                margin: 0 0 16px 0;
                display: flex;
                align-items: center;

                &::before {
                    content: '';
                    display: inline-block;
                    width: 4px;
                    height: 16px;
                    background-color: $primary-color;
                    margin-right: 8px;
                    border-radius: 2px;
                }
            }

            // 骨架屏
            .skeleton-loading {
                padding: 20px;
                border-radius: 8px;
                background-color: $card-bg;
            }

            // 数据卡片
            .data-card {
                border-radius: 8px;
                box-shadow: $shadow-light;
                border: 1px solid $border-color;
                transition: $transition;

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
                }

                :deep(.el-card__body) {
                    padding: 20px 16px;
                }

                :deep(.el-statistic__title) {
                    color: $text-secondary;
                    font-size: 14px;
                    margin-bottom: 8px;
                }

                :deep(.el-statistic__content) {
                    line-height: 1;
                }

                // 不同卡片的主题色
                &.voltage-card {
                    border-left: 4px solid #909399;
                }

                &.current-card {
                    border-left: 4px solid #67C23A;
                }

                &.power-card {
                    border-left: 4px solid $primary-color;
                }

                &.energy-card {
                    border-left: 4px solid #E6A23C;
                }
            }
        }

        // 空数据提示
        .empty-tip {
            padding: 60px 0;
            text-align: center;

            :deep(.el-empty) {
                --el-empty-text-color: $text-placeholder;
            }
        }

        // 图表区域
        .chart-section {
            .section-title {
                font-size: 16px;
                font-weight: 500;
                color: $text-primary;
                margin: 0 0 16px 0;
                display: flex;
                align-items: center;

                &::before {
                    content: '';
                    display: inline-block;
                    width: 4px;
                    height: 16px;
                    background-color: $primary-color;
                    margin-right: 8px;
                    border-radius: 2px;
                }
            }

            // 图表容器
            .chart-container {
                height: 400px;
                width: 100%;
                border: 1px solid $border-color;
                border-radius: 8px;
                background-color: $card-bg;
                transition: $transition;

                &:hover {
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
                }
            }

            // 图表加载
            .chart-loading {
                height: 400px;
                border-radius: 8px;
                overflow: hidden;
            }

            // 图表空数据
            .chart-empty {
                height: 400px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid $border-color;
                border-radius: 8px;
                background-color: $card-bg;

                :deep(.el-empty) {
                    --el-empty-text-color: $text-placeholder;
                }
            }
        }
    }
}
</style>