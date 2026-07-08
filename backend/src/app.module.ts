import { Module } from "@nestjs/common";
import { CanvasModule } from "./canvas/canvas.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [CanvasModule],
  controllers: [HealthController],
})
export class AppModule {}
