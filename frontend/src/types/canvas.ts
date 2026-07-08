export type CanvasNodeType = "circle" | "rectangle";

export type CanvasNode = {
  id: string;
  type: CanvasNodeType;
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  label: string;
  color: string;
};

export type CanvasState = {
  nodes: CanvasNode[];
};
