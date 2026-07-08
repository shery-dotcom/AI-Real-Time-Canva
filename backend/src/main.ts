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

  const port = Number(process.env.PORT ?? 8080);

  await app.listen(port);
}

void bootstrap();
