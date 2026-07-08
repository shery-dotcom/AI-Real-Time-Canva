import { create } from "zustand";
import type { CanvasNode } from "../types/canvas";

type CanvasStoreState = {
  nodes: CanvasNode[];
  setNodes: (nodes: CanvasNode[]) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
};

export const useCanvasStore = create<CanvasStoreState>((set) => ({
  nodes: [],
  setNodes: (nodes) => set({ nodes: nodes.slice(0, 12).map(sanitizeNode) }),
  updateNodePosition: (id, x, y) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, x: clamp(x, CANVAS_WIDTH), y: clamp(y, CANVAS_HEIGHT) }
          : node,
      ),
    })),
}));

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 720;

function sanitizeNode(node: CanvasNode): CanvasNode {
  const type =
    node.type === "circle" || node.type === "rectangle"
      ? node.type
      : "rectangle";
  const label = node.label.trim().slice(0, 2);
  const x = clamp(node.x, CANVAS_WIDTH);
  const y = clamp(node.y, CANVAS_HEIGHT);

  if (type === "circle") {
    return {
      ...node,
      type,
      label,
      x,
      y,
      radius: clampSize(node.radius ?? 36, 20, 72),
    };
  }

  return {
    ...node,
    type,
    label,
    x,
    y,
    width: clampSize(node.width ?? 120, 56, 220),
    height: clampSize(node.height ?? 72, 40, 160),
  };
}

function clamp(value: number, max: number): number {
  return Math.min(
    Math.max(Math.round(Number.isFinite(value) ? value : 0), 0),
    max - 1,
  );
}

function clampSize(value: number, min: number, max: number): number {
  const safeValue = Number.isFinite(value) ? value : min;
  return Math.min(Math.max(Math.round(safeValue), min), max);
}
