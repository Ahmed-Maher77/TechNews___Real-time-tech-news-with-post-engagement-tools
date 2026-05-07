import { Router } from "express";
import { updateMe } from "../controllers/userController.js";
import { authRequired } from "../middlewares/auth.js";
import { uploadAvatar } from "../middlewares/upload.js";

const router = Router();

router.patch("/me", authRequired, uploadAvatar.single("avatar"), updateMe);

export default router;
