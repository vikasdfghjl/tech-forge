import { Request, Response, NextFunction } from 'express';
import debug from 'debug';

const logger = debug('tech-forge:request');

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    logger(`${req.method} ${req.url}`);
    logger('Body: %O', req.body);

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger(
            `${req.method} ${req.url} ${res.statusCode} ${duration}ms`
        );
    });

    next();
};
