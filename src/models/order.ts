export interface Order {
  id: string;
  productionTarget: number;
  productionState: number;
  [key: string]: any;
}