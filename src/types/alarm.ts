export interface AlarmRecord {
    id: number;
    deviceId: number;
    alarmType: number;
    alarmValue: number;
    alarmDesc: string;
    triggerTime: string; // ISO 字符串
    status: 0 | 1;       // 0-未处理，1-已处理
    handleTime?: string; // ISO 字符串，可为空
}
