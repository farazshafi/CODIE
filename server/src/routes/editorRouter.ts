import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { getSavedCode, saveCode } from "../controllers/editorController";
import { updateCodeSchema } from "../validation/editorValidation";
import { validate } from "../middlewares/validate";

const editorRouter = Router()

editorRouter.put("/save_code", authenticate, validate(updateCodeSchema), saveCode)
editorRouter.get("/get_code/:id", authenticate, getSavedCode)

export default editorRouter