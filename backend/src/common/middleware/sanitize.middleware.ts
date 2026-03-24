import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// @ts-ignore
import xss from 'xss-clean';

@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    xss()(req, res, next);
  }
}
