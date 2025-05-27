import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // 记录错误日志
    this.logger.error(`异常: ${JSON.stringify(exceptionResponse)}`);

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
      const message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse['message'] || '未授权';

      return response.status(status).json({
        code: status,
        message,
        data: null
      });
    }

    // 处理其他错误
    const message = typeof exceptionResponse === 'string'
      ? exceptionResponse
      : exceptionResponse['message'] || '服务器错误';

    return response.status(status).json({
      code: status,
      message,
      data: null
    });
  }
}
