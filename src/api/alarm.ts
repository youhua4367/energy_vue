import request from "@/utils/request"; // axios 封装实例
import type { AlarmRecord } from "@/types/alarm";

// 查询设备告警列表
export const getAlarmList = (deviceId: number | null) => {
    return request.get<{ data: AlarmRecord[] }>("/user/alarm/list", {
        params: { deviceId },
    });
};

// 今日告警数量
export const getTodayAlarmCount = () => {
    return request.get<{ data: number }>("/user/alarm/count/today");
};

// 未处理告警数量
export const getUnhandledAlarmCount = () => {
    return request.get<{ data: number }>("/user/alarm/count/unhandled");
};

// 按类型统计告警数量
export const getAlarmCountByType = () => {
    return request.get<{ data: Record<number, number> }>("/user/alarm/count/type");
};

// 处理告警
export const handleAlarm = (alarmId: number) => {
    return request.post<{ data: string }>("/user/alarm/handle", null, {
        params: { alarmId },
    });
};
