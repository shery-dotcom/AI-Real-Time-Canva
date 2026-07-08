import { useEffect, useRef, useState } from "react";
import { Group, Circle, Layer, Rect, Stage, Text } from "react-konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { socket } from "../lib/socket";
import { useCanvasStore } from "../store/canvas";
import type { CanvasState } from "../types/canvas";

export function CanvasBoard() {
  const nodes = useCanvasStore((state) => state.nodes);
  const setNodes = useCanvasStore((state) => state.setNodes);
  const updateNodePosition = useCanvasStore(
    (state) => state.updateNodePosition,
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const handleCanvasGenerated = (nextState: CanvasState) => {
      setNodes(nextState.nodes);
    };

    const handleNodeMoved = (payload: { id: string; x: number; y: number }) => {
      updateNodePosition(payload.id, payload.x, payload.y);
    };

    socket.on("canvas:generated", handleCanvasGenerated);
    socket.on("node:moved", handleNodeMoved);

    return () => {
      socket.off("canvas:generated", handleCanvasGenerated);
      socket.off("node:moved", handleNodeMoved);
    };
  }, [setNodes, updateNodePosition]);

  return (
    <div className="canvas-shell" ref={containerRef}>
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        className="canvas-stage"
      >
        <Layer>
          {nodes.map((node) => {
            const dragHandlers = {
              draggable: true,
              onDragEnd: (event: KonvaEventObject<DragEvent>) => {
                const nextX = event.target.x();
                const nextY = event.target.y();
                updateNodePosition(node.id, nextX, nextY);
                socket.emit("node:move", {
                  id: node.id,
                  x: nextX,
                  y: nextY,
                });
              },
            };

            if (node.type === "circle") {
              const radius = node.radius ?? 36;
              const labelSize = Math.max(20, Math.floor(radius * 0.65));

              return (
                <Group key={node.id} x={node.x} y={node.y} {...dragHandlers}>
                  <Circle
                    x={0}
                    y={0}
                    radius={radius}
                    fill={node.color}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={2}
                  />
                  <Text
                    x={-radius}
                    y={-labelSize / 2}
                    width={radius * 2}
                    height={labelSize}
                    text={node.label}
                    fill="#ffffff"
                    fontSize={labelSize}
                    fontStyle="bold"
                    align="center"
                    verticalAlign="middle"
                    listening={false}
                  />
                </Group>
              );
            }

            const width = node.width ?? 140;
            const height = node.height ?? 96;
            const labelSize = Math.max(
              20,
              Math.floor(Math.min(width, height) * 0.35),
            );

            return (
              <Group key={node.id} x={node.x} y={node.y} {...dragHandlers}>
                <Rect
                  x={-width / 2}
                  y={-height / 2}
                  width={width}
                  height={height}
                  fill={node.color}
                  cornerRadius={18}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={2}
                />
                <Text
                  x={-width / 2}
                  y={-labelSize / 2}
                  width={width}
                  height={labelSize}
                  text={node.label}
                  fill="#ffffff"
                  fontSize={labelSize}
                  fontStyle="bold"
                  align="center"
                  verticalAlign="middle"
                  listening={false}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>

      {nodes.length === 0 ? (
        <div className="empty-canvas">
          Type a prompt above to generate shapes
        </div>
      ) : null}
    </div>
  );
}
