import request from "@/utils/request.ts"
import type {ApiResponse} from "@/types/api.ts";

// 查询设备
export const getDeviceList = (): Promise<ApiResponse> => {
    return request.get("/admin/device/list")
}

// 新增设备
export const addDevice = (device: Device): Promise<ApiResponse> =>
    request.post("/admin/device/add", device)

// 更新设备
export const updateDevice = (device: Device): Promise<ApiResponse> =>
    request.post("/admin/device/update", device)

// 删除设备
export const deleteDevice = (id: number): Promise<ApiResponse> =>
    request.post(`/admin/device/delete?id=${id}`)

// 修改设备状态
export const changeDeviceStatus = (id: number, status: number): Promise<ApiResponse> =>
    request.post("/admin/device/status", { id, status })