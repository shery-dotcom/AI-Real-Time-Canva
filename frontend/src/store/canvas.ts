import { create } from "zustand";
import type { CanvasNode } from "../types/canvas";

type CanvasStoreState = {
  nodes: CanvasNode[];
  setNodes: (nodes: CanvasNode[]) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
};

export const useCanvasStore = create<CanvasStoreState>((set) => ({
  nodes: [],
  setNodes: (nodes) => set({ nodes }),
  updateNodePosition: (id, x, y) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, x, y } : node,
      ),
    })),
}));
