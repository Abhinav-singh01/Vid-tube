import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import  userRouter from "./routes/register.js";
dotenv.config();

const app = express();
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.cors_ORIGIN || "http://localhost:3000", // Default fallback
    credentials: true,
  })
);
app.use("/api/v1/users",  userRouter);
export { app };
