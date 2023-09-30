import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';

    res.on('finish', () => {
      const { statusCode, statusMessage } = res;
      const contentLength = res.get('content-length');

      const message = `${method} - ${originalUrl} | ${statusCode} - ${statusMessage} | ${contentLength} - ${userAgent} | ${ip}`;

      if (statusCode >= 500) return this.logger.error(message);
      if (statusCode >= 400) return this.logger.warn(message);
      // save db
      console.info(
        contentLength,
        ip,
        method,
        originalUrl,
        statusCode,
        statusMessage,
        userAgent,
      );

      return this.logger.log(message);
    });

    next();
  }
}
