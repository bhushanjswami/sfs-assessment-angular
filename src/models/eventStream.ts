export interface StreamEventPayload {
  deviceId: string;
  status: string;
  timestamp?: string;
  partsPerMinute: number;
  order?: string | null;
}