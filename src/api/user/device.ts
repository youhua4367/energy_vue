import request from "@/utils/request.ts"
import type {ApiResponse} from "@/types/api.ts";


export const getDeviceList = (): Promise<ApiResponse> => {
    return request.get("/admin/device/list")
}