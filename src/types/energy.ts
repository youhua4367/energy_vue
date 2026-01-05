// 能源数据实体
export interface EnergyData {
    id: number
    deviceId: number
    voltage: number       // 电压 V
    current: number       // 电流 A
    power: number         // 功率 W
    totalEnergy: number   // 累积用电量 kWh
    collectTime: string   // 数据时间 ISO 字符串
}

// 能源概览
export interface EnergyOverview {
    todayEnergy: number      // 今日用电量 kWh
    monthEnergy: number      // 本月用电量 kWh
    deviceCount: number      // 设备总数
    todayAlarmCount: number  // 今日告警数
}

// 能耗统计（折线图）
export interface EnergyStatistics {
    time: string         // 日期或月份
    energy: number       // 用电量
}

// 实时监控数据
export interface EnergyRealtime {
    deviceId: number
    voltage: number
    current: number
    power: number
    totalEnergy: number
    collectTime: string
}

// 设备上报数据 DTO
export interface EnergyReport {
    deviceId: number
    voltage: number
    current: number
    power: number
    totalEnergy: number
    collectTime: string
}
