import { Request, Response, NextFunction } from 'express';
import debug from 'debug';

const logger = debug('tech-forge:error');

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger('Error: %O', err);
    logger('Request path: %s', req.path);
    logger('Request body: %O', req.body);

    res.status(500).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};
