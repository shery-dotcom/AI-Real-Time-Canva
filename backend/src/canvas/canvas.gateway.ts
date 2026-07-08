import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
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

  @SubscribeMessage("node:move")
  async handleNodeMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { id: string; x: number; y: number },
  ): Promise<void> {
    await this.canvasStore.updateNodePosition(body.id, body.x, body.y);

    client.broadcast.emit("node:moved", {
      id: body.id,
      x: body.x,
      y: body.y,
    });
  }

  broadcastCanvasState(state: CanvasSnapshot): void {
    this.server.emit("canvas:generated", state);
  }
}
