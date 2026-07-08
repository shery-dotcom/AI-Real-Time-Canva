import { useEffect, useRef, useState } from "react";
import { Fragment } from "react";
import { Circle, Layer, Rect, Stage, Text } from "react-konva";
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

    socket.on("canvas:generated", handleCanvasGenerated);

    return () => {
      socket.off("canvas:generated", handleCanvasGenerated);
    };
  }, [setNodes]);

  return (
    <div className="canvas-shell" ref={containerRef}>
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        className="canvas-stage"
      >
        <Layer>
          {nodes.map((node) => {
            const commonProps = {
              x: node.x,
              y: node.y,
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
              const size = radius * 2;

              return (
                <Fragment key={node.id}>
                  <Circle
                    {...commonProps}
                    radius={radius}
                    offsetX={radius}
                    offsetY={radius}
                    fill={node.color}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={2}
                  />
                  <Text
                    key={`${node.id}-label`}
                    x={node.x - size / 2}
                    y={node.y - 10}
                    width={size}
                    text={node.label}
                    fill="#ffffff"
                    fontStyle="bold"
                    align="center"
                    verticalAlign="middle"
                    listening={false}
                  />
                </Fragment>
              );
            }

            const width = node.width ?? 140;
            const height = node.height ?? 96;

            return (
              <Fragment key={node.id}>
                <Rect
                  {...commonProps}
                  width={width}
                  height={height}
                  fill={node.color}
                  cornerRadius={18}
                  offsetX={width / 2}
                  offsetY={height / 2}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={2}
                />
                <Text
                  key={`${node.id}-label`}
                  x={node.x - width / 2}
                  y={node.y - 10}
                  width={width}
                  text={node.label}
                  fill="#ffffff"
                  fontStyle="bold"
                  align="center"
                  verticalAlign="middle"
                  listening={false}
                />
              </Fragment>
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
