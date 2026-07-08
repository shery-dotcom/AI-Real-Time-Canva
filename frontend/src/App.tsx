import { useEffect, useState } from "react";
import { CanvasBoard } from "./components/CanvasBoard";
import { PromptBar } from "./components/PromptBar";
import { socket } from "./lib/socket";
import { useCanvasStore } from "./store/canvas";
import type { CanvasState } from "./types/canvas";

export default function App() {
  const setNodes = useCanvasStore((state) => state.setNodes);
  const [prompt, setPrompt] = useState("Create a connected layout");
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    const loadState = async () => {
      try {
        const response = await fetch("/api/canvas/state");
        const data = (await response.json()) as CanvasState;
        setNodes(data.nodes);
      } catch {
        setStatus("Backend unavailable");
      }
    };

    void loadState();

    const handleConnect = () => setStatus("Connected");
    const handleDisconnect = () => setStatus("Disconnected");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [setNodes]);

  const generateCanvas = async () => {
    const response = await fetch("/api/canvas/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = (await response.json()) as CanvasState;
    setNodes(data.nodes);
  };

  return (
    <main className="app-shell">
      <PromptBar
        prompt={prompt}
        status={status}
        onPromptChange={setPrompt}
        onGenerate={() => {
          void generateCanvas();
        }}
      />

      <CanvasBoard />
    </main>
  );
}
