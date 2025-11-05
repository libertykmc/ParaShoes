// src/main.ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('ParaShoes API')
    .setDescription('Документация REST API для дипломного проекта')
    .setVersion('1.0')
    .addBearerAuth() // чтобы можно было авторизоваться в Swagger
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(3000)
  console.log(`Swagger UI: http://localhost:3000/api`)
}
bootstrap()
