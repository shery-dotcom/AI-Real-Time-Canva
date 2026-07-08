import { Injectable, OnModuleInit } from "@nestjs/common";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { CanvasNode, CanvasSnapshot } from "./canvas.types";

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
}
