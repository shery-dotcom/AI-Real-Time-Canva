import { Body, Controller, Get, Post, Put } from "@nestjs/common";
import { CanvasAiService } from "./canvas-ai.service";
import { CanvasLayoutService } from "./canvas-layout.service";
import { CanvasGateway } from "./canvas.gateway";
import { CanvasSnapshot } from "./canvas.types";
import { CanvasStore } from "./canvas.store";

@Controller("canvas")
export class CanvasController {
  constructor(
    private readonly canvasStore: CanvasStore,
    private readonly canvasGateway: CanvasGateway,
    private readonly canvasAiService: CanvasAiService,
    private readonly canvasLayoutService: CanvasLayoutService,
  ) {}

  @Post("generate")
  async generate(@Body() body: { prompt: string }): Promise<CanvasSnapshot> {
    const plan = await this.canvasAiService.createGenerationPlan(body.prompt);
    const state = this.canvasStore.sanitizeSnapshot(
      this.canvasLayoutService.buildSnapshot(plan),
    );
    await this.canvasStore.replaceState(state);
    this.canvasGateway.broadcastCanvasState(state);
    return state;
  }

  @Get("state")
  async getState(): Promise<CanvasSnapshot> {
    return this.canvasStore.getState();
  }

  @Put("state")
  async replaceState(@Body() body: CanvasSnapshot): Promise<CanvasSnapshot> {
    const state = await this.canvasStore.replaceState(
      this.canvasStore.sanitizeSnapshot(body),
    );
    this.canvasGateway.broadcastCanvasState(state);
    return state;
  }
}
