import { Router } from "express";
import {
    createPost,
    featuredPosts,
    getPost,
    listAllForAdmin,
    listPosts,
    myPosts,
    patchPost,
    setFeatured,
} from "../controllers/postController.js";
import {
    createComment,
    listComments,
    voteComment,
} from "../controllers/commentController.js";
import { adminOnly, authRequired, optionalAuth } from "../middlewares/auth.js";
import { uploadPostImage } from "../middlewares/upload.js";

const router = Router();

router.get("/", listPosts);
router.get("/featured", featuredPosts);
router.get("/mine", authRequired, myPosts);
router.get("/admin/all", authRequired, adminOnly, listAllForAdmin);
router.post("/", authRequired, uploadPostImage.single("imageFile"), createPost);
router.get("/:id", getPost);
router.patch("/:id", optionalAuth, patchPost);
router.patch("/:id/featured", authRequired, adminOnly, setFeatured);

router.get("/:id/comments", listComments);
router.post("/:id/comments", authRequired, createComment);
router.post("/:id/comments/:commentId/vote", authRequired, voteComment);

export default router;
