import { Injectable, OnModuleInit } from "@nestjs/common";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { CanvasNode, CanvasSnapshot, CanvasNodeType } from "./canvas.types";

const STATE_FILE_PATH = join(process.cwd(), "data", "canvas-state.json");

@Injectable()
export class CanvasStore implements OnModuleInit {
  private state: CanvasSnapshot = { nodes: [] };

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
      nodes: state.nodes.map((node) => ({ ...node })),
    };

    await this.persist();
    return this.getState();
  }

  async generateFromPrompt(prompt: string): Promise<CanvasSnapshot> {
    const normalizedPrompt = prompt.trim() || "Untitled canvas node";
    const type = this.resolveNodeType(normalizedPrompt);
    const node = this.createNode(normalizedPrompt, type);

    this.state = {
      nodes: [...this.state.nodes, node],
    };

    await this.persist();
    return this.getState();
  }

  private async load(): Promise<void> {
    await mkdir(dirname(STATE_FILE_PATH), { recursive: true });

    try {
      const content = await readFile(STATE_FILE_PATH, "utf8");
      const parsed = JSON.parse(content) as Partial<CanvasSnapshot>;

      this.state = {
        nodes: Array.isArray(parsed.nodes)
          ? parsed.nodes.map((node) => ({ ...node }))
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

  private resolveNodeType(prompt: string): CanvasNodeType {
    const lowerPrompt = prompt.toLowerCase();

    if (lowerPrompt.includes("circle")) {
      return "circle";
    }

    if (lowerPrompt.includes("rectangle")) {
      return "rectangle";
    }

    return prompt.length % 2 === 0 ? "rectangle" : "circle";
  }

  private createNode(prompt: string, type: CanvasNodeType): CanvasNode {
    const hash = this.hashPrompt(prompt);
    const x = 48 + (hash % 720);
    const y = 48 + ((hash >> 3) % 420);
    const color = this.pickColor(hash);

    if (type === "circle") {
      return {
        id: randomUUID(),
        type,
        x,
        y,
        radius: 36 + (hash % 36),
        label: prompt,
        color,
      };
    }

    return {
      id: randomUUID(),
      type,
      x,
      y,
      width: 96 + (hash % 120),
      height: 64 + ((hash >> 5) % 96),
      label: prompt,
      color,
    };
  }

  private hashPrompt(prompt: string): number {
    let hash = 0;

    for (let index = 0; index < prompt.length; index += 1) {
      hash = (hash * 31 + prompt.charCodeAt(index)) | 0;
    }

    return Math.abs(hash);
  }

  private pickColor(hash: number): string {
    const palette = [
      "#ef4444",
      "#f97316",
      "#eab308",
      "#22c55e",
      "#06b6d4",
      "#3b82f6",
      "#8b5cf6",
    ];
    return palette[hash % palette.length];
  }
}
