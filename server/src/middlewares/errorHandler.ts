import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/HttpError";

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
    void next
    console.error(err);

    if (err instanceof ZodError) {
        res.status(400).json({
            message: "Validation failed",
            errors: err.errors.map(e => ({ field: e.path.join("."), message: e.message }))
        });
    } else if (err instanceof HttpError) {
        res.status(err.statusCode).json({ message: err.message });
    } else {
        res.status(500).json({ message: err instanceof Error ? err.message : "Internal Server Error" });
    }
};