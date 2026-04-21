import { Router, Request, Response } from "express";
import axios from "axios";

const PISTON_URL = process.env.PISTON_URL || "http://localhost:2000";

const executeRouter = Router();

executeRouter.get("/runtimes", async (req: Request, res: Response) => {
    try {
        const response = await axios.get(`${PISTON_URL}/api/v2/runtimes`, {
            headers: {
                Accept: "application/json",
            },
        });

        res.status(response.status).json(response.data);
    } catch (error: any) {
        console.error("Error fetching runtimes from piston:", error?.response?.data || error.message);

        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({
                message: "Failed to connect to code execution engine",
                error: error.message,
            });
        }
    }
});

executeRouter.post("/", async (req: Request, res: Response) => {
    try {
        const response = await axios.post(`${PISTON_URL}/api/v2/execute`, req.body, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        res.status(response.status).json(response.data);
    } catch (error: any) {
        console.error("Error executing code via piston proxy:", error?.response?.data || error.message);

        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({
                message: "Failed to connect to code execution engine",
                error: error.message,
            });
        }
    }
});

export default executeRouter;
