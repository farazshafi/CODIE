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

export const getProjectByRoomId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { roomId } = req.params

        const projectId = await projectService.getProjectByRoomId(String(roomId))

        res.status(201).json({
            message: "Project id Found",
            projectId
        });
    } catch (err) {
        next(err)
    }
}

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const result = await projectService.deleteProject(id);

        res.status(200).json(result);
    } catch (err) {
        next(err)
    }
} 