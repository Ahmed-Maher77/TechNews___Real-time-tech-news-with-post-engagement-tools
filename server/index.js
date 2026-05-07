import dotenv from "dotenv";
import { resolve } from "path";
import app from "./app.js";
import { connectDb } from "./config/db.js";

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
    app.listen(PORT, () => {
        console.log(`API listening on http://localhost:${PORT}`);
    });
    connectWithRetry();
}

start();
