import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * HTTPException을 처리하는 코드
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const err = exception.getResponse() as
      | { message: any; statusCode: number }
      | { error: string; statusCode: 400; message: string[] };

    // if (typeof err !== 'string' && err.statusCode === 400) {
    //   return response.status(status).json({
    //     success: false,
    //     code: status,
    //     data: err.message,
    //   });
    // }

    response.status(status).json({
      success: false,
      code: status,
      timestamp: new Date().toUTCString(),
      path: request.url,
      message: err.message,
    });
  }
}
