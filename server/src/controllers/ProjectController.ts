import { Request, Response, NextFunction } from "express";
import { projectService } from "../services/projectServices";


export const createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const projectData = req.body

        const newProject = await projectService.createProject({ userId: req.user.id, ...projectData })

        res.status(201).json({
            message: "Project created successfully",
            data: newProject
        });
    } catch (err) {
        next(err)
    }
} 