
import { Request, Response, NextFunction } from "express";
import { roomService } from "../container";

export const authorizeRole = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user.id;
        const projectId = req.body.projectId;

        try {
            const role = await roomService.getUserRoleInProject(projectId, userId);

            if (!allowedRoles.includes(role)) {
                return res.status(403).json({ message: "Access denied: insufficient permissions." });
            }

            next();
        } catch (err) {
            console.error("Role check failed", err);
            return res.status(500).json({ message: "Internal server error while checking role." });
        }
    };
};
