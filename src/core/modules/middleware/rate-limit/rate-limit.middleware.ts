import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as rateLimit from 'express-rate-limit';

/**
 * @description middlware to implement rate-limit middlware
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    rateLimit({
      windowMs: 10000,
      max: 10,
    })(req, res, next);
  }
}
