import { Injectable, OnModuleInit } from "@nestjs/common";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { CanvasNode, CanvasSnapshot } from "./canvas.types";

const STATE_FILE_PATH = join(process.cwd(), "data", "canvas-state.json");

@Injectable()
export class CanvasStore implements OnModuleInit {
  private state: CanvasSnapshot = { nodes: [] };
  private readonly canvasWidth = 1200;
  private readonly canvasHeight = 720;

  async onModuleInit(): Promise<void> {
    await this.load();
  }

  getState(): CanvasSnapshot {
    return {
      nodes: this.state.nodes.map((node) => ({ ...node })),
    };
  }

  async replaceState(state: CanvasSnapshot): Promise<CanvasSnapshot> {
    this.state = {
      nodes: state.nodes.slice(0, 12).map((node) => this.sanitizeNode(node)),
    };

    await this.persist();
    return this.getState();
  }

  async updateNodePosition(
    id: string,
    x: number,
    y: number,
  ): Promise<CanvasSnapshot> {
    this.state = {
      nodes: this.state.nodes.map((node) =>
        node.id === id ? { ...node, x, y } : node,
      ),
    };

    await this.persist();
    return this.getState();
  }

  sanitizeSnapshot(snapshot: CanvasSnapshot): CanvasSnapshot {
    return {
      nodes: snapshot.nodes.slice(0, 12).map((node) => this.sanitizeNode(node)),
    };
  }

  private async load(): Promise<void> {
    await mkdir(dirname(STATE_FILE_PATH), { recursive: true });

    try {
      const content = await readFile(STATE_FILE_PATH, "utf8");
      const parsed = JSON.parse(content) as Partial<CanvasSnapshot>;

      this.state = {
        nodes: Array.isArray(parsed.nodes)
          ? parsed.nodes.slice(0, 12).map((node) => this.sanitizeNode(node))
          : [],
      };
    } catch {
      this.state = { nodes: [] };
      await this.persist();
    }
  }

  private async persist(): Promise<void> {
    await mkdir(dirname(STATE_FILE_PATH), { recursive: true });
    await writeFile(
      STATE_FILE_PATH,
      `${JSON.stringify(this.state, null, 2)}\n`,
      "utf8",
    );
  }

  private sanitizeNode(node: CanvasNode): CanvasNode {
    const type =
      node.type === "circle" || node.type === "rectangle"
        ? node.type
        : "rectangle";
    const label =
      typeof node.label === "string" ? node.label.trim().slice(0, 2) : "";
    const color =
      typeof node.color === "string" && node.color.trim().length > 0
        ? this.normalizeColor(node.color)
        : "#6366f1";
    const x = this.clampCoordinate(node.x, this.canvasWidth);
    const y = this.clampCoordinate(node.y, this.canvasHeight);

    if (type === "circle") {
      return {
        id: node.id,
        type,
        x,
        y,
        radius: this.clampDimension(node.radius ?? 36, 20, 72),
        label,
        color,
      };
    }

    return {
      id: node.id,
      type,
      x,
      y,
      width: this.clampDimension(node.width ?? 120, 56, 220),
      height: this.clampDimension(node.height ?? 72, 40, 160),
      label,
      color,
    };
  }

  private clampCoordinate(value: number, max: number): number {
    const safeValue = Number.isFinite(value) ? value : 0;
    return Math.min(Math.max(Math.round(safeValue), 0), max - 1);
  }

  private clampDimension(value: number, min: number, max: number): number {
    const safeValue = Number.isFinite(value) ? value : min;
    return Math.min(Math.max(Math.round(safeValue), min), max);
  }

  private normalizeColor(color: string): string {
    const normalized = color.trim().toLowerCase();

    if (
      normalized === "black" ||
      normalized === "#000" ||
      normalized === "#000000" ||
      normalized === "rgb(0,0,0)" ||
      normalized === "rgba(0,0,0,1)"
    ) {
      return "#6366f1";
    }

    return color;
  }
}
