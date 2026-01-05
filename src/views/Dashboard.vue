<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { ElMessage } from "element-plus";

// API
import { getDeviceList } from "@/api/device";
import {
    getTodayAlarmCount,
    getUnhandledAlarmCount,
    getAlarmCountByType,
    getAlarmList
} from "@/api/alarm";
import { getEnergyOverview, getEnergyStatistics } from "@/api/energy";

// ECharts
import * as echarts from "echarts/core";
import { LineChart, PieChart } from "echarts/charts";
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
    LineChart,
    PieChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent,
    CanvasRenderer
]);

// ---------------------- 状态 ----------------------
const deviceCount = ref(0);
const todayEnergy = ref(0);
const todayAlarmCount = ref(0);
const unhandledAlarmCount = ref(0);

const energyTrend = ref<any[]>([]);
const alarmTypeData = ref<Record<number, number>>({});
const latestAlarms = ref<any[]>([]);

let energyChart: echarts.ECharts | null = null;
let alarmChart: echarts.ECharts | null = null;

// ---------------------- 数据获取 ----------------------
const fetchOverview = async () => {
    try {
        const [deviceRes, energyRes, todayRes, unhandledRes] = await Promise.all([
            getDeviceList(),
            getEnergyOverview(),
            getTodayAlarmCount(),
            getUnhandledAlarmCount()
        ]);

        deviceCount.value = deviceRes.data.length;
        todayEnergy.value = energyRes.data.todayEnergy || 0;
        todayAlarmCount.value = todayRes.data;
        unhandledAlarmCount.value = unhandledRes.data;
    } catch (e) {
        ElMessage.error("加载系统概览失败");
        console.error(e);
    }
};

const fetchEnergyTrend = async () => {
    const res = await getEnergyStatistics(undefined, "day");
    energyTrend.value = res.data;
    await nextTick();
    drawEnergyChart();
};

const fetchAlarmType = async () => {
    const res = await getAlarmCountByType();
    alarmTypeData.value = res.data;
    await nextTick();
    drawAlarmChart();
};

const fetchLatestAlarms = async () => {
    const res = await getAlarmList(undefined);
    latestAlarms.value = res.data
        .sort(
            (a: any, b: any) =>
                new Date(b.triggerTime).getTime() - new Date(a.triggerTime).getTime()
        )
        .slice(0, 5);
};

// ---------------------- 图表 ----------------------
const drawEnergyChart = () => {
    const dom = document.getElementById("energy-chart");
    if (!dom) return;

    if (!energyChart) energyChart = echarts.init(dom);

    energyChart.setOption({
        title: { text: "今日能耗趋势", left: "center" },
        tooltip: { trigger: "axis" },
        grid: { left: "5%", right: "5%", bottom: "8%", containLabel: true },
        xAxis: {
            type: "category",
            data: energyTrend.value.map(d => d.time)
        },
        yAxis: {
            type: "value",
            name: "kWh"
        },
        series: [
            {
                type: "line",
                smooth: true,
                data: energyTrend.value.map(d => d.energy)
            }
        ]
    });
};

const drawAlarmChart = () => {
    const dom = document.getElementById("alarm-chart");
    if (!dom) return;

    if (!alarmChart) alarmChart = echarts.init(dom);

    alarmChart.setOption({
        title: { text: "告警类型分布", left: "center" },
        tooltip: { trigger: "item" },
        legend: { bottom: 0 },
        series: [
            {
                type: "pie",
                radius: "60%",
                data: Object.entries(alarmTypeData.value).map(([k, v]) => ({
                    name:
                        k === "1"
                            ? "电压告警"
                            : k === "2"
                                ? "电流告警"
                                : "功率告警",
                    value: v
                }))
            }
        ]
    });
};

// ---------------------- 初始化 ----------------------
onMounted(async () => {
    await fetchOverview();
    await fetchEnergyTrend();
    await fetchAlarmType();
    await fetchLatestAlarms();
});
</script>

<template>
    <div class="dashboard-container">
        <!-- KPI -->
        <el-row :gutter="20" class="kpi-row">
            <el-col :span="6">
                <el-card>设备总数<br /><b>{{ deviceCount }}</b></el-card>
            </el-col>
            <el-col :span="6">
                <el-card>今日能耗(kWh)<br /><b>{{ todayEnergy }}</b></el-card>
            </el-col>
            <el-col :span="6">
                <el-card>今日告警<br /><b>{{ todayAlarmCount }}</b></el-card>
            </el-col>
            <el-col :span="6">
                <el-card>未处理告警<br /><b>{{ unhandledAlarmCount }}</b></el-card>
            </el-col>
        </el-row>

        <!-- 图表 -->
        <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="14">
                <el-card>
                    <div id="energy-chart" style="height: 320px"></div>
                </el-card>
            </el-col>
            <el-col :span="10">
                <el-card>
                    <div id="alarm-chart" style="height: 320px"></div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 最新告警 -->
        <el-card style="margin-top: 20px">
            <h3>最新告警</h3>
            <el-table :data="latestAlarms" border>
                <el-table-column prop="deviceId" label="设备ID" width="100" />
                <el-table-column prop="alarmDesc" label="告警描述" />
                <el-table-column prop="alarmValue" label="告警值" width="120" />
                <el-table-column prop="triggerTime" label="时间" width="180" />
                <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 0 ? 'danger' : 'success'">
                            {{ row.status === 0 ? "未处理" : "已处理" }}
                        </el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<style scoped>
.dashboard-container {
    padding: 20px;
}
.kpi-row b {
    font-size: 22px;
    color: #409eff;
}
</style>
