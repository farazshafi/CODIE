import { logger } from "../utils/logger";
import { randomUUID } from "crypto";

export function attachLogger(req, res, next) {
    const requestId = randomUUID();

    req.logger = logger.child({
        requestId,
        userId: req.headers["x-user-id"] || null,
    });

    next();
}
