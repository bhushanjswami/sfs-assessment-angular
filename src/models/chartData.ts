export interface ChartDataItem {
  timestamp: string | Date;
  partsPerMinute: number;
  partsProduced: number;
  [key: string]: any; 
}