import dotenv from "dotenv";
import { resolve } from "path";
import { createServer } from "http";
import app from "./app.js";
import { connectDb } from "./config/db.js";
import { initSocket } from "./realtime/socket.js";

dotenv.config({ path: resolve(process.cwd(), ".env") });
dotenv.config({ path: resolve(process.cwd(), "../.env") });

const PORT = Number(process.env.PORT) || 5000;
const DB_RETRY_MS = 10_000;

async function connectWithRetry() {
    try {
        await connectDb();
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection failed. Retrying...", err.message);
        setTimeout(connectWithRetry, DB_RETRY_MS);
    }
}

function start() {
    const server = createServer(app);
    const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";
    initSocket(server, clientOrigin);
    server.listen(PORT, () => {
        console.log(`API listening on http://localhost:${PORT}`);
    });
    connectWithRetry();
}

start();
