import { Router } from "express";
import {
    createAdmin,
    getDashboardStats,
    listModerationPosts,
    moderatePost,
} from "../controllers/adminController.js";
import { adminOnly, authRequired } from "../middlewares/auth.js";

const router = Router();

router.post("/admins", authRequired, adminOnly, createAdmin);
router.get("/stats", authRequired, adminOnly, getDashboardStats);
router.get("/posts/moderation", authRequired, adminOnly, listModerationPosts);
router.patch("/posts/:id/moderation", authRequired, adminOnly, moderatePost);

export default router;
