import { Router } from "express";
import { getUserById, updateMe } from "../controllers/userController.js";
import { authRequired } from "../middlewares/auth.js";
import { uploadAvatar } from "../middlewares/upload.js";

const router = Router();

router.patch("/me", authRequired, uploadAvatar.single("avatar"), updateMe);
router.get("/:id", getUserById);

export default router;
