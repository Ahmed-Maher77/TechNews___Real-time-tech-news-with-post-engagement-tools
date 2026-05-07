import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const middlewareDir = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(middlewareDir, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || "";
        const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
        cb(null, safe);
    },
});

function imageFileFilter(_req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
        cb(new Error("Only image files are allowed"));
        return;
    }
    cb(null, true);
}

export const uploadAvatar = multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: imageFileFilter,
});

export const uploadPostImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFileFilter,
});
