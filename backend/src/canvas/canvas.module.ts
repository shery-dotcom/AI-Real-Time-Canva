import { Module } from "@nestjs/common";
import { CanvasController } from "./canvas.controller";
import { CanvasGateway } from "./canvas.gateway";
import { CanvasStore } from "./canvas.store";

@Module({
  controllers: [CanvasController],
  providers: [CanvasStore, CanvasGateway],
  exports: [CanvasStore],
})
export class CanvasModule {}
