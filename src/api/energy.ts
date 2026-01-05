import request from "@/utils/request.ts"
import type { ApiResponse } from "@/types/api.ts"
import type {
    EnergyData,
    EnergyOverview,
    EnergyStatistics,
    EnergyRealtime,
    EnergyReport
} from "@/types/energy"

// 上传能源数据
export const reportEnergy = (data: EnergyReport): Promise<ApiResponse<string>> =>
    request.post("/user/energy/report", data)

// 查询能源数据列表
export const getEnergyList = (
    deviceId?: number,
    startTime?: string,
    endTime?: string
): Promise<ApiResponse<EnergyData[]>> =>
    request.get("/user/energy/list", { params: { deviceId, startTime, endTime } })

// 能源概览
export const getEnergyOverview = (): Promise<ApiResponse<EnergyOverview>> =>
    request.get("/user/energy/overview")

// 能耗统计（折线图）
export const getEnergyStatistics = (
    deviceId?: number,
    type?: string
): Promise<ApiResponse<EnergyStatistics[]>> =>
    request.get("/user/energy/statistics", { params: { deviceId, type } })

// 实时监控数据
export const getEnergyRealtime = (deviceId: number): Promise<ApiResponse<EnergyRealtime>> =>
    request.get("/user/energy/realtime", { params: { deviceId } })
