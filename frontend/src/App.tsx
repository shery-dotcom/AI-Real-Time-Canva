import { FormEvent, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

type CanvasNodeType = "circle" | "rectangle";

type CanvasNode = {
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

type CanvasState = {
  nodes: CanvasNode[];
};

const API_BASE_URL = "http://localhost:8080";

export default function App() {
  const [state, setState] = useState<CanvasState>({ nodes: [] });
  const [prompt, setPrompt] = useState("A collaborative circle");
  const [status, setStatus] = useState("Connecting to backend...");

  const socket = useMemo<Socket>(() => {
    return io(API_BASE_URL, {
      path: "/socket.io",
      transports: ["websocket"],
    });
  }, []);

  useEffect(() => {
    let active = true;

    const loadState = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/canvas/state`);
        const data = (await response.json()) as CanvasState;

        if (active) {
          setState(data);
          setStatus("Connected to canvas state");
        }
      } catch {
        if (active) {
          setStatus("Backend unavailable");
        }
      }
    };

    loadState();

    socket.on("connect", () => {
      if (active) {
        setStatus("Socket connected");
      }
    });

    socket.on("canvas:generated", (nextState: CanvasState) => {
      if (active) {
        setState(nextState);
      }
    });

    socket.on("disconnect", () => {
      if (active) {
        setStatus("Socket disconnected");
      }
    });

    return () => {
      active = false;
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [socket]);

  const submitPrompt = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await fetch(`${API_BASE_URL}/api/canvas/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const nextState = (await response.json()) as CanvasState;
    setState(nextState);
  };

  const saveState = async () => {
    const response = await fetch(`${API_BASE_URL}/api/canvas/state`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(state),
    });

    const nextState = (await response.json()) as CanvasState;
    setState(nextState);
  };

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">AI Real-Time Canva</p>
          <h1>Generate and sync canvas nodes from a prompt.</h1>
          <p className="description">
            This frontend listens to Socket.io updates from the Nest backend and
            keeps the canvas state in sync.
          </p>
        </div>

        <div className="status-pill">{status}</div>
      </section>

      <section className="toolbar-card">
        <form className="prompt-form" onSubmit={submitPrompt}>
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe a circle, rectangle, or canvas idea"
          />
          <button type="submit">Generate</button>
        </form>

        <button className="secondary-button" type="button" onClick={saveState}>
          Save current state
        </button>
      </section>

      <section className="canvas-card">
        <div className="canvas-header">
          <h2>Canvas state</h2>
          <span>{state.nodes.length} nodes</span>
        </div>

        <div className="canvas-board">
          {state.nodes.length === 0 ? (
            <div className="empty-state">
              No nodes yet. Generate one from the prompt above.
            </div>
          ) : (
            state.nodes.map((node) => (
              <div
                key={node.id}
                className={`canvas-node ${node.type}`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width:
                    node.type === "rectangle"
                      ? `${node.width ?? 140}px`
                      : `${(node.radius ?? 36) * 2}px`,
                  height:
                    node.type === "rectangle"
                      ? `${node.height ?? 96}px`
                      : `${(node.radius ?? 36) * 2}px`,
                  background: node.color,
                }}
              >
                <span>{node.label}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
