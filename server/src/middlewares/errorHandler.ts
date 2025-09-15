import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/HttpError";
import { HttpStatusCode } from "../utils/httpStatusCodes";

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
    void next
    console.error(err);

    if (err instanceof ZodError) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
            message: "Validation failed",
            errors: err.errors.map(e => ({ field: e.path.join("."), message: e.message }))
        });
    } else if (err instanceof HttpError) {
        res.status(err.statusCode).json({ message: err.message });
    } else {
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: err instanceof Error ? err.message : "Internal Server Error" });
    }
};