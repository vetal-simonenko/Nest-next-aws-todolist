import { Handler } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";

let cachedServer: Handler;

async function bootstrap(): Promise<Handler> {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: true,
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    await app.init();

    const expressApp = app.getHttpAdapter().getInstance();

    return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event, context, callback) => {
    cachedServer ??= await bootstrap();

    return cachedServer(event, context, callback);
};