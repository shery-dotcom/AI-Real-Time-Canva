import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix("api");

  await app.listen(8080);
}

void bootstrap();
