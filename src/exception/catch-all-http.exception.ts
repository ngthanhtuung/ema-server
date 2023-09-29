import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import {
  CannotCreateEntityIdMapError,
  EntityNotFoundError,
  QueryFailedError,
  TypeORMError,
} from 'typeorm';

@Catch(
  QueryFailedError,
  EntityNotFoundError,
  CannotCreateEntityIdMapError,
  HttpException,
)
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    let message = 'Server error';
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      message = exception['response']['message'] as string;
      httpStatus = exception.getStatus();
    }

    if (exception instanceof TypeORMError) {
      if (exception instanceof QueryFailedError) {
        message = (exception as QueryFailedError).message;
        httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;
      }
      if (exception instanceof EntityNotFoundError) {
        message = (exception as EntityNotFoundError).message;
        httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;
      }
      if (exception instanceof CannotCreateEntityIdMapError) {
        message = (exception as CannotCreateEntityIdMapError).message;
        httpStatus = HttpStatus.UNPROCESSABLE_ENTITY;
      }
    }

    httpAdapter.reply(
      ctx.getResponse(),
      GlobalResponseError(httpStatus, message, request),
      httpStatus,
    );
  }
}

export const GlobalResponseError: (
  statusCode: number,
  message: string,
  request: Request,
) => IResponseError = (
  statusCode: number,
  message: string,
  request: Request,
): IResponseError => {
  return {
    statusCode: statusCode,
    message,
    timestamp: new Date().toISOString(),
    path: request.url,
    method: request.method,
  };
};

export interface IResponseError {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  method: string;
}
