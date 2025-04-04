import express from "express"
import cors from "cors"
import userRouter from "./routes/userRouter"
import { setupGraphQl } from "./graphql"
import { ENV } from "./config/env"
import { errorHandler } from "./middlewares/errorHandler"
import connectDB from "./db"

// initialization
const app = express()
const PORT = ENV.PORT
connectDB()

// middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json())
app.use(express.urlencoded({ extended: true })); 

// Rest api Route
app.use("/api", userRouter)


setupGraphQl(app)

// error handleware
app.use(errorHandler)

// listen
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
