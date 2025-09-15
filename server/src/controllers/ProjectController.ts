import { Request, Response, NextFunction } from "express";
import { IProjectService } from "../services/interface/IProjectService";
import mongoose from "mongoose";
import { IRoomService } from "../services/interface/IRoomService";
import { HttpStatusCode } from "../utils/httpStatusCodes";

export class ProjectController {
  constructor(
    private readonly projectService: IProjectService,
    private readonly roomService: IRoomService

  ) { }

  createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectData = req.body;
      const newProject = await this.projectService.createProject({
        userId: req.user.id,
        ...projectData
      });

      res.status(HttpStatusCode.CREATED).json({
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
      res.status(HttpStatusCode.OK).json(project);
    } catch (err) {
      next(err);
    }
  };

  getAllProjects = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.projectService.getAllProjects();
      res.status(HttpStatusCode.OK).json(projects);
    } catch (err) {
      next(err);
    }
  };

  getProjectsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.projectService.getProjectsByUserId(req.user.id);
      res.status(HttpStatusCode.OK).json(projects);
    } catch (err) {
      next(err);
    }
  };

  getProjectByRoomId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roomId } = req.params;
      const projectId = await this.projectService.getProjectByRoomId(roomId);
      res.status(HttpStatusCode.OK).json({
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
      res.status(HttpStatusCode.OK).json({ success: true, data: updatedCode });
    } catch (err) {
      next(err);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.projectService.deleteProject(id);
      res.status(HttpStatusCode.OK).json(result);
    } catch (err) {
      next(err);
    }
  };

  saveCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, projectId } = req.body;
      const updatedCode = await this.projectService.saveCode(projectId, code);
      res.status(HttpStatusCode.OK).json({ success: true, data: updatedCode });
    } catch (err) {
      next(err);
    }
  };

  getUsedLangauges = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id
      console.log("user is getting", userId)

      const usedLangauges = await this.projectService.getUsedLanguages(new mongoose.Types.ObjectId(userId))

      res.status(HttpStatusCode.OK).json({ usedLangauges })

    } catch (error) {
      next(error)
    }
  }

  getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id

      const projects = await this.projectService.getProjectsByUserId(userId)

      res.status(HttpStatusCode.OK).json(projects)

    } catch (error) {
      next(error)
    }
  }

  getContributedProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id

      const projects = await this.roomService.getContributedProjectsByUserId(userId)

      res.status(HttpStatusCode.OK).json(projects)

    } catch (error) {
      next(error)
    }
  }


}
