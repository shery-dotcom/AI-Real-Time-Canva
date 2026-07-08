# AI Real-Time Canvas

A full-stack collaborative canvas app where users describe shapes in plain English and an AI generates them in real time — synced live across all connected tabs.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript, React Konva, Zustand, Vite |
| Backend | NestJS (Node.js), Socket.io |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Persistence | JSON file (`backend/data/canvas-state.json`) |

---

## How to Run

### 1. Clone the repo

```bash
git clone https://github.com/shery-dotcom/AI-Real-Time-Canva.git
cd AI-Real-Time-Canva
```

### 2. Install dependencies

```bash
npm install
```

> This installs dependencies for both the `backend` and `frontend` workspaces from the root.

### 3. Configure the backend environment

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and set your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=8080
```

Get a free Groq API key at [console.groq.com](https://console.groq.com).

### 4. Start the backend

```bash
npm run dev:backend
```

Runs at **http://localhost:8080**

### 5. Start the frontend

In a separate terminal:

```bash
npm run dev:frontend
```

Runs at **http://localhost:5173**

### 6. Open the app

Navigate to [http://localhost:5173](http://localhost:5173) in your browser. Open multiple tabs to see real-time sync in action.

---

## Features

- **Prompt Input** — Type a natural-language prompt like `"Create a 3x4 grid of circles labeled A–L"` and hit Generate
- **AI → JSON** — The backend sends the prompt to Groq, which returns a structured layout plan (pattern + shapes + labels). Coordinates are computed server-side
- **Canvas Rendering** — Shapes (circles and rectangles) rendered via React Konva with labels
- **Draggable Shapes** — Every shape is draggable; positions update in real time
- **Real-time Sync** — All connected clients stay in sync via Socket.io (`canvas:generated`, `node:move`, `node:moved`)
- **Persistence** — Canvas state is saved to disk on the backend and restored on page refresh

---

## Socket Events

| Event | Direction | Description |
|---|---|---|
| `canvas:generated` | Server → Client | Broadcast when a new canvas is generated or a client connects |
| `node:move` | Client → Server | Emitted when a user drags a shape |
| `node:moved` | Server → Client | Broadcast to all other clients when a node position changes |

> Canvas generation is triggered via `POST /api/canvas/generate` (HTTP) rather than a socket event, keeping the generation lifecycle request/response style while the sync path is fully socket-based.

---

## Constraints Enforced

- **Shapes**: `circle` and `rectangle` only
- **Max shapes**: 12 (validated on both backend and frontend)
- **Label length**: Max 2 characters (validated on both backend and frontend)
- **Canvas bounds**: All coordinates clamped to canvas dimensions (1200×720) on both sides
- **AI output**: Groq is instructed to return JSON only; markdown fences are stripped and the response is validated before use

---

## Sample Prompts

```
Create a star layout with 1 center node and 6 surrounding nodes
Create a 3x4 grid of circles labeled A–L
Create 4 rectangles in a row and 1 circle above center
```

---

## Short Note

### AI Tool Used

**Groq API** with the `llama-3.3-70b-versatile` model.

The AI is used exclusively to interpret user intent and return a high-level layout plan (which patterns to use, which shapes, and what labels/colors). It is explicitly *not* asked to compute coordinates — that logic lives in `canvas-layout.service.ts` on the backend, keeping the AI output deterministic and easy to validate.

### What I'd Improve

- **Streaming generation** — Show shapes appearing one by one as the AI responds, rather than waiting for the full response
- **`canvas:generate` as a socket event** — Move generation fully onto the WebSocket channel so it fits the event-driven model end-to-end
- **Undo / Redo** — Track canvas state history so users can step back through changes
- **Shape deletion** — Let users click to select and delete individual shapes
- **Multi-user cursors** — Show live cursor positions of other connected users
- **Persisting drag positions per-user** — Currently all users share one global canvas state; a room-based model would allow isolated canvases
- **OpenAI / Gemini fallback** — Add a fallback LLM provider if Groq is unavailable
