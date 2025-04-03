import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction): void => {
    console.error(err);

    if (err instanceof ZodError) {
        res.status(400).json({ 
            message: "Validation failed", 
            errors: err.errors.map(e => ({ field: e.path.join("."), message: e.message }))
        });
    } else {
        res.status(500).json({ message: err instanceof Error ? err.message : "Internal Server Error" });
    }
};
