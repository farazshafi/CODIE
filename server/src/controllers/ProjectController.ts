import { Request, Response, NextFunction } from "express";
import { projectService } from "../container";


export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectData = req.body;
    const newProject = await projectService.createProject({
      userId: req.user.id,
      ...projectData
    });

    res.status(201).json({
      message: "Project created successfully",
      data: newProject
    });
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);
    res.status(200).json(project);
  } catch (err) {
    next(err);
  }
};

export const getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await projectService.getAllProjects();
    res.status(200).json(projects);
  } catch (err) {
    next(err);
  }
};

export const getProjectsByUserId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await projectService.getProjectsByUserId(req.user.id);
    res.status(200).json(projects);
  } catch (err) {
    next(err);
  }
};

export const getProjectByRoomId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roomId } = req.params;
    const projectId = await projectService.getProjectByRoomId(roomId);
    res.status(200).json({
      message: "Project id Found",
      projectId
    });
  } catch (err) {
    next(err);
  }
};

export const getSavedCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const updatedCode = await projectService.getSavedCode(id)

    res.status(200).json({ success: true, data: updatedCode })

  } catch (err) {
    next(err)
  }

}

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await projectService.deleteProject(id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const saveCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, projectId } = req.body

    const updatedCode = await projectService.saveCode(projectId, code)

    res.status(200).json({ success: true, data: updatedCode })

  } catch (err) {
    next(err)
  }

}