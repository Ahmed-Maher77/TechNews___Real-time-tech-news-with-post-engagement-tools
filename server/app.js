import "express-async-errors";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
    cors({
        origin: clientOrigin,
        credentials: true,
    }),
);

app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const appDir = path.dirname(fileURLToPath(import.meta.url));
const uploadsPath = path.join(appDir, "uploads");
app.use("/uploads", express.static(uploadsPath));

app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", postRoutes);

app.use(errorHandler);

export default app;
