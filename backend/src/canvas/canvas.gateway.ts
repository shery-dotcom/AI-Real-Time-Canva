import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { CanvasSnapshot } from "./canvas.types";
import { CanvasStore } from "./canvas.store";

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  path: "/socket.io",
})
export class CanvasGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server!: Server;

  constructor(private readonly canvasStore: CanvasStore) {}

  handleConnection(client: Socket): void {
    client.emit("canvas:generated", this.canvasStore.getState());
  }
  broadcastCanvasState(state: CanvasSnapshot): void {
    this.server.emit("canvas:generated", state);
  }
}
