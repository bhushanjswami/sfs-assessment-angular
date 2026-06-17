export interface Device {
  id: string;
  name: string;
  type?: string;
  status?: string;
  [key: string]: any;
}