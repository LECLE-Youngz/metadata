import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(
    {
      origin: "*", // Allow all domains
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    }
  );
  app.useGlobalPipes(new ValidationPipe());

  const port = 8080;
  await app.listen(port);
  Logger.log(`🚀 Listening HTTP at http://0.0.0.0:${port}`, "HTTP");
}
bootstrap();
