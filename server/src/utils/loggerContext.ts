import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { randomUUID } from "crypto";

export function attachLogger(req: Request, res: Response, next: NextFunction) {
    const requestId = randomUUID();

    (req as any).logger = logger.child({
        requestId,
        userId: req.headers["x-user-id"] || null,
    });

    next();
}
