import { Body, Controller, Get, Post, Put } from "@nestjs/common";
import { CanvasGateway } from "./canvas.gateway";
import { CanvasSnapshot } from "./canvas.types";
import { CanvasStore } from "./canvas.store";

@Controller("canvas")
export class CanvasController {
  constructor(
    private readonly canvasStore: CanvasStore,
    private readonly canvasGateway: CanvasGateway,
  ) {}

  @Post("generate")
  async generate(@Body() body: { prompt: string }): Promise<CanvasSnapshot> {
    const state = await this.canvasStore.generateFromPrompt(body.prompt);
    this.canvasGateway.broadcastCanvasState(state);
    return state;
  }

  @Get("state")
  async getState(): Promise<CanvasSnapshot> {
    return this.canvasStore.getState();
  }

  @Put("state")
  async replaceState(@Body() body: CanvasSnapshot): Promise<CanvasSnapshot> {
    const state = await this.canvasStore.replaceState(body);
    this.canvasGateway.broadcastCanvasState(state);
    return state;
  }
}
