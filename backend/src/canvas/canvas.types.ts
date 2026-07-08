export type CanvasNodeType = "circle" | "rectangle";

export interface CanvasNode {
  id: string;
  type: CanvasNodeType;
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  label: string;
  color: string;
}

export interface CanvasSnapshot {
  nodes: CanvasNode[];
}
