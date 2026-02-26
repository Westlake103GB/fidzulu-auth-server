import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global API prefix
  const apiPathPrefix = 'api/v1';
  app.setGlobalPrefix(apiPathPrefix);

  // Swagger/OpenAPI configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('FidZulu Auth API')
    .setDescription('Authentication API for FidZulu')
    .setVersion('0.0.1')
    .addBearerAuth({type: 'http', scheme: 'bearer', bearerFormat: 'JWT'}, 'access-token')
    .build();
  
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPathPrefix}/api-docs`, app, swaggerDocument);
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
