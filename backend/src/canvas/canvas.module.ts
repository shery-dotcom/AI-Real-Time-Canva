import { Module } from "@nestjs/common";
import { CanvasAiService } from "./canvas-ai.service";
import { CanvasLayoutService } from "./canvas-layout.service";
import { CanvasController } from "./canvas.controller";
import { CanvasGateway } from "./canvas.gateway";
import { CanvasStore } from "./canvas.store";

@Module({
  controllers: [CanvasController],
  providers: [CanvasStore, CanvasGateway, CanvasAiService, CanvasLayoutService],
  exports: [CanvasStore],
})
export class CanvasModule {}
