import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // 处理验证错误
    if (status === HttpStatus.BAD_REQUEST && Array.isArray(exceptionResponse['message'])) {
      return response.status(status).json({
        code: status,
        message: exceptionResponse['message'][0],
        data: null
      });
    }

    // 处理 401 未授权错误
    if (status === HttpStatus.UNAUTHORIZED) {
      return response.status(status).json({
        code: status,
        message: exceptionResponse['message'] || '未授权',
        data: null
      });
    }

    // 处理其他错误
    return response.status(status).json({
      code: status,
      message: exceptionResponse['message'] || '服务器错误',
      data: null
    });
  }
}
