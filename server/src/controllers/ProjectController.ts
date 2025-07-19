import { Request, Response, NextFunction } from "express";
import { IProjectService } from "../services/interface/IProjectService";

export class ProjectController {
  constructor(private readonly projectService: IProjectService) { }

  createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectData = req.body;
      const newProject = await this.projectService.createProject({
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

  getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(id);
      res.status(200).json(project);
    } catch (err) {
      next(err);
    }
  };

  getAllProjects = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.projectService.getAllProjects();
      res.status(200).json(projects);
    } catch (err) {
      next(err);
    }
  };

  getProjectsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.projectService.getProjectsByUserId(req.user.id);
      res.status(200).json(projects);
    } catch (err) {
      next(err);
    }
  };

  getProjectByRoomId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roomId } = req.params;
      const projectId = await this.projectService.getProjectByRoomId(roomId);
      res.status(200).json({
        message: "Project id found",
        projectId
      });
    } catch (err) {
      next(err);
    }
  };

  getSavedCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedCode = await this.projectService.getSavedCode(id);
      res.status(200).json({ success: true, data: updatedCode });
    } catch (err) {
      next(err);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.projectService.deleteProject(id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  saveCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, projectId } = req.body;
      const updatedCode = await this.projectService.saveCode(projectId, code);
      res.status(200).json({ success: true, data: updatedCode });
    } catch (err) {
      next(err);
    }
  };
}
