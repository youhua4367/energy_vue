export interface Device {
    id: number
    deviceName: string
    sn: string
    buildingId: string
    roomNo: string
    // 设备状态，0表示未使用，1表示正在使用，2表示禁用
    status: number
    maxPower: number
}
