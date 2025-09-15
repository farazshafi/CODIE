
import { Request, Response, NextFunction } from "express";
import { roomService, projectService } from "../container";
import { HttpStatusCode } from "../utils/httpStatusCodes";

export const authorizeRole = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user.id;
        const projectId = req.body.projectId;

        try {
            const project = await projectService.getProjectById(projectId);
            if (!project) {
                res.status(HttpStatusCode.NOT_FOUND).json({ message: "Project not found." });
                return;
            }

            if (project.userId.toString() === userId) {
                return next();
            }

            const role = await roomService.getUserRoleInProject(projectId, userId);

            if (role && allowedRoles.includes(role)) {
                return next();
            }

            res.status(HttpStatusCode.FORBIDDEN).json({ message: "Access denied: insufficient permissions." });
        } catch (err) {
            console.error("Role check failed", err);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error while checking role." });
        }
    };
};
