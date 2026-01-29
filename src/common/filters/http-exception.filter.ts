import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { errorResponse } from '../base/base.response';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error('Caught Exception:', exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal Server Error';
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        message = String(exceptionResponse.message);
      } else {
        message = exception.message || 'Internal Server Error';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      if (exception.name === 'ValidationError') {
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json(errorResponse(message, HttpStatus.BAD_REQUEST));
      }
      if (
        exception.name === 'MongoError' ||
        (exception as any).code === 11000
      ) {
        message = 'Duplicate key error';
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json(errorResponse(message, HttpStatus.BAD_REQUEST));
      }
    } else {
      // Handle cases where exception is not an instance of Error or HttpException
      message =
        typeof exception === 'string'
          ? exception
          : (exception as any)?.message || JSON.stringify(exception);
    }

    const errorResponseObject = errorResponse(message, status);
    // Add extra details for debugging (Can be removed in production)
    if (exception) {
      (errorResponseObject as any).error = exception;
      (errorResponseObject as any).stack = (exception as any).stack;
    }

    response.status(status).json(errorResponseObject);
  }
}
