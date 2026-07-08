import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  CanvasGenerationPlan,
  CanvasGroupPlan,
  CanvasNode,
  CanvasNodeType,
  CanvasPattern,
  CanvasSnapshot,
} from "./canvas.types";

interface LayoutArea {
  left: number;
  top: number;
  width: number;
  height: number;
}

@Injectable()
export class CanvasLayoutService {
  private readonly canvasWidth = 1200;
  private readonly canvasHeight = 720;

  buildSnapshot(plan: CanvasGenerationPlan): CanvasSnapshot {
    const nodes: CanvasNode[] = [];
    const groupHeight = this.canvasHeight / plan.groups.length;

    plan.groups.forEach((group, groupIndex) => {
      const area: LayoutArea = {
        left: 0,
        top: groupIndex * groupHeight,
        width: this.canvasWidth,
        height: groupHeight,
      };

      nodes.push(...this.layoutGroup(group, area));
    });

    return { nodes };
  }

  private layoutGroup(group: CanvasGroupPlan, area: LayoutArea): CanvasNode[] {
    switch (group.pattern) {
      case "row":
        return this.layoutRow(group, area);
      case "column":
        return this.layoutColumn(group, area);
      case "grid":
        return this.layoutGrid(group, area);
      case "radial":
        return this.layoutRadial(group, area);
      case "single":
      default:
        return this.layoutSingle(group, area);
    }
  }

  private layoutRow(group: CanvasGroupPlan, area: LayoutArea): CanvasNode[] {
    const count = group.nodes.length;
    const centerY = area.top + area.height / 2;
    const spacing = area.width / (count + 1);

    return group.nodes.map((node, index) =>
      this.createNode(node.label, node.color, group.shape, {
        x: area.left + spacing * (index + 1),
        y: centerY,
        index,
      }),
    );
  }

  private layoutColumn(group: CanvasGroupPlan, area: LayoutArea): CanvasNode[] {
    const count = group.nodes.length;
    const centerX = area.left + area.width / 2;
    const spacing = area.height / (count + 1);

    return group.nodes.map((node, index) =>
      this.createNode(node.label, node.color, group.shape, {
        x: centerX,
        y: area.top + spacing * (index + 1),
        index,
      }),
    );
  }

  private layoutGrid(group: CanvasGroupPlan, area: LayoutArea): CanvasNode[] {
    const count = group.nodes.length;
    const cols = group.cols ?? Math.max(1, Math.ceil(Math.sqrt(count)));
    const rows = Math.ceil(count / cols);
    const cellWidth = area.width / cols;
    const cellHeight = area.height / rows;

    return group.nodes.map((node, index) => {
      const column = index % cols;
      const row = Math.floor(index / cols);

      return this.createNode(node.label, node.color, group.shape, {
        x: area.left + cellWidth * column + cellWidth / 2,
        y: area.top + cellHeight * row + cellHeight / 2,
        index,
      });
    });
  }

  private layoutRadial(group: CanvasGroupPlan, area: LayoutArea): CanvasNode[] {
    const count = group.nodes.length;
    const centerX = area.left + area.width / 2;
    const centerY = area.top + area.height / 2;
    const radius = Math.min(area.width, area.height) * 0.3;
    const ringCount = group.hasCenter ? Math.max(count - 1, 0) : count;

    return group.nodes.map((node, index) => {
      if (group.hasCenter && index === 0) {
        return this.createNode(node.label, node.color, group.shape, {
          x: centerX,
          y: centerY,
          index,
        });
      }

      const ringIndex = group.hasCenter ? index - 1 : index;
      const angle =
        ringCount === 0
          ? 0
          : (Math.PI * 2 * ringIndex) / Math.max(ringCount, 1);

      return this.createNode(node.label, node.color, group.shape, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        index,
      });
    });
  }

  private layoutSingle(group: CanvasGroupPlan, area: LayoutArea): CanvasNode[] {
    const centerX = area.left + area.width / 2;
    const centerY = area.top + area.height / 2;

    return group.nodes.map((node, index) =>
      this.createNode(node.label, node.color, group.shape, {
        x: centerX,
        y: centerY,
        index,
      }),
    );
  }

  private createNode(
    label: string,
    color: string,
    type: CanvasNodeType,
    position: { x: number; y: number; index: number },
  ): CanvasNode {
    const offsetX = (position.index % 3) * 14 - 14;
    const offsetY = Math.floor(position.index / 3) * 14 - 14;

    if (type === "circle") {
      return {
        id: randomUUID(),
        type,
        x: Math.round(position.x + offsetX),
        y: Math.round(position.y + offsetY),
        radius: 34,
        label,
        color,
      };
    }

    return {
      id: randomUUID(),
      type,
      x: Math.round(position.x + offsetX),
      y: Math.round(position.y + offsetY),
      width: 120,
      height: 72,
      label,
      color,
    };
  }
}
