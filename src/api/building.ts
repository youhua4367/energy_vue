import request from "@/utils/request.ts";
import type { ApiResponse } from "@/types/api.ts";
import type { Building } from "@/types/building.ts";

// 查询所有建筑
export const getBuildingList = (): Promise<ApiResponse> =>
    request.get("/admin/building/list");

// 新增建筑
export const addBuilding = (building: Building): Promise<ApiResponse> =>
    request.post("/admin/building/add", building);

// 更新建筑
export const updateBuilding = (building: Building): Promise<ApiResponse> =>
    request.post("/admin/building/update", building);

// 删除建筑
export const deleteBuilding = (id: number): Promise<ApiResponse> =>
    request.post(`/admin/building/delete?id=${id}`);
