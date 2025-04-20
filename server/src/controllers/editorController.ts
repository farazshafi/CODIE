import { NextFunction, Request, Response } from "express";
import { editorServices } from "../services/editorServices";


export const saveCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code, projectId } = req.body

        const updatedCode = await editorServices.saveCode(projectId, code)

        res.status(200).json({ success: true, data: updatedCode })

    } catch (err) {
        next(err)
    }

}


export const getSavedCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params

        const updatedCode = await editorServices.getSavedCode(id)

        res.status(200).json({ success: true, data: updatedCode })

    } catch (err) {
        next(err)
    }

}