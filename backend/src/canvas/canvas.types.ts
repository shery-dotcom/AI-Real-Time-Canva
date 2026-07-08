export type CanvasNodeType = "circle" | "rectangle";
export type CanvasPattern = "row" | "column" | "grid" | "radial" | "single";

export interface CanvasGroupNode {
  label: string;
  color: string;
}

export interface CanvasGroupPlan {
  pattern: CanvasPattern;
  shape: CanvasNodeType;
  nodes: CanvasGroupNode[];
  cols?: number;
  hasCenter?: boolean;
}

export interface CanvasGenerationPlan {
  groups: CanvasGroupPlan[];
}

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
