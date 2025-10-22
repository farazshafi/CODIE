import { Request, Response, NextFunction } from "express";
import { IProjectService } from "../services/interface/IProjectService";
import mongoose from "mongoose";
import { IRoomService } from "../services/interface/IRoomService";
import { HttpStatusCode } from "../utils/httpStatusCodes";
import { ApiResponse } from "../utils/ApiResponse";

export class ProjectController {
  constructor(
    private readonly _projectService: IProjectService,
    private readonly _roomService: IRoomService

  ) { }

  createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectData = req.body;
      const newProject = await this._projectService.createProject({
        userId: req.user.id,
        ...projectData
      });

      const response = new ApiResponse(HttpStatusCode.CREATED, newProject, "Project created succesfully")
      res.status(response.statusCode).json(response)
    } catch (err) {
      next(err);
    }
  };

  getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const project = await this._projectService.getProjectById(id);
      const response = new ApiResponse(HttpStatusCode.OK, project, "succesfully found Project by id")
      res.status(response.statusCode).json(response)
    } catch (err) {
      next(err);
    }
  };

  getAllProjects = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this._projectService.getAllProjects();
      const response = new ApiResponse(HttpStatusCode.OK, projects, "succesfully Found all projects")
      res.status(response.statusCode).json(response)
    } catch (err) {
      next(err);
    }
  };

  getProjectsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params
      const projects = await this._projectService.getProjectsByUserId(userId);
      const response = new ApiResponse(HttpStatusCode.OK, projects, "succesfully Found Project")
      res.status(response.statusCode).json(response)
    } catch (err) {
      next(err);
    }
  };

  getProjectByRoomId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roomId } = req.params;
      const projectId = await this._projectService.getProjectByRoomId(roomId);
      const response = new ApiResponse(HttpStatusCode.OK, projectId, "succesfully Project Found")
      res.status(response.statusCode).json(response)
    } catch (err) {
      next(err);
    }
  };

  getSavedCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedCode = await this._projectService.getSavedCode(id);
      const response = new ApiResponse(HttpStatusCode.OK, { success: true, data: updatedCode }, "succesfully Found Saved code")
      res.status(response.statusCode).json(response)
    } catch (err) {
      next(err);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this._projectService.deleteProject(id);
      const response = new ApiResponse(HttpStatusCode.OK, result, "succesfully Deleted project")
      res.status(response.statusCode).json(response)
    } catch (err) {
      next(err);
    }
  };

  saveCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, projectId } = req.body;
      const updatedCode = await this._projectService.saveCode(projectId, code);
      const response = new ApiResponse(HttpStatusCode.OK, { success: true, data: updatedCode }, "succesfully code saved")
      res.status(response.statusCode).json(response)
    } catch (err) {
      next(err);
    }
  };

  getUsedLangauges = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {id} = req.params

      const usedLangauges = await this._projectService.getUsedLanguages(new mongoose.Types.ObjectId(id))

      const response = new ApiResponse(HttpStatusCode.OK, usedLangauges, "succesfully Found User languages")
      res.status(response.statusCode).json(response)

    } catch (error) {
      next(error)
    }
  }

  getProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id

      const projects = await this._projectService.getProjectsByUserId(userId)

      const response = new ApiResponse(HttpStatusCode.OK, projects, "succesfully Found Project")
      res.status(response.statusCode).json(response)

    } catch (error) {
      next(error)
    }
  }

  getContributedProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params
      console.log("chekcing input: ", userId)

      const projects = await this._roomService.getContributedProjectsOld(userId)
      console.log("projects from controller : ", projects)
      const response = new ApiResponse(HttpStatusCode.OK, projects, "succesfully Found Contributed Project")
      res.status(response.statusCode).json(response)
    } catch (error) {
      next(error)
    }
  }

  getContributorDeatils = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params

      const projects = await this._roomService.getContributedProjectsDetailsByUserId(userId)
      const response = new ApiResponse(HttpStatusCode.OK, projects, "succesfully Found Contributed Project")
      res.status(response.statusCode).json(response)
    } catch (error) {
      next(error)
    }
  }

}
