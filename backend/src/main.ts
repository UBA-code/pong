import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as passport from 'passport';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

console.log = () => {};

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PROPERTY_DEPS_METADATA } from '@nestjs/common/constants';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    if (response.headersSent) {
      return;
    }
    const request = ctx.getRequest<Request>();
    let status =
      exception instanceof HttpException ? exception.getStatus() : 403;

    if (status === 500) status = 403;

    const message =
      exception instanceof HttpException ? exception.getResponse() : exception;

    response.status(status).json({
      // statusCode: status,
      path: request.url,
      message: message instanceof Object ? (message as any).message : message,
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser()); // this will allow us to use cookies in our app

  app.use(
    session({
      secret: process.env.JWT_SECRET, // this is used to sign the session id cookie
      saveUninitialized: false, // if true, it will save the session even if nothing is changed
      resave: false, // if true, it will create a session even if nothing is stored in it
      cookie: {
        maxAge: 60000 * 60, // 60 minute
      },
    }),
  );
  // the passport is a middleware that will help us to authenticate the user
  app.use(passport.initialize()); // this will initialize the passport middleware
  app.use(passport.session()); // this will tell passport to use sessions

  const corsOptions: CorsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'], // if a request has these headers, it will be allowed to pass through otherwise it will be blocked
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  };

  app.enableCors(corsOptions);

  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.VITE_BACKEND_PORT || 3000);
}

bootstrap();
