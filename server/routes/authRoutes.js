import { Router } from "express";
import {
    login,
    logout,
    me,
    register,
    session,
} from "../controllers/authController.js";
import { uploadAvatar } from "../middlewares/upload.js";

const router = Router();

router.post("/register", uploadAvatar.single("avatar"), register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/session", session);
router.get("/me", me);

export default router;
