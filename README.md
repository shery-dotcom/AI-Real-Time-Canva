# AI Real-Time Canva

Full-stack TypeScript monorepo with a NestJS backend and a React frontend for collaborative canvas state generation and editing.

## Structure

- `backend` - NestJS API, Socket.io server, and canvas persistence
- `frontend` - React client for live canvas interaction

## Run

Install dependencies in the workspace root, then run the apps separately:

- `npm run dev:backend`
- `npm run dev:frontend`

## Backend AI

The backend canvas generator uses Groq with the `llama-3.3-70b-versatile` model.

Set `GROQ_API_KEY` in the backend environment before calling `POST /api/canvas/generate`.
