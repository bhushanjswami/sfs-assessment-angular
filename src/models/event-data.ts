export interface DeviceEvent {
  timestamp: number;
  partsPerMinute: number;
  status: string;
  deviceId: string;
  order: string;
}