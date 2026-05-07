import { Router } from "express";
import { createAdmin } from "../controllers/adminController.js";
import { adminOnly, authRequired } from "../middlewares/auth.js";

const router = Router();

router.post("/admins", authRequired, adminOnly, createAdmin);

export default router;
