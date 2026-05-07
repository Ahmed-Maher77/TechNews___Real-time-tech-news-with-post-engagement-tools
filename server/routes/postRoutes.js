import { Router } from "express";
import {
    createPost,
    deletePost,
    featuredPosts,
    getPost,
    listAllForAdmin,
    listPosts,
    listPostReactionUsers,
    myPosts,
    patchPost,
    reactToPost,
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

router.get("/", optionalAuth, listPosts);
router.get("/featured", optionalAuth, featuredPosts);
router.get("/mine", authRequired, myPosts);
router.get("/admin/all", authRequired, adminOnly, listAllForAdmin);
router.post("/", authRequired, uploadPostImage.single("imageFile"), createPost);
router.get("/:id", optionalAuth, getPost);
router.get("/:id/reactions/users", authRequired, listPostReactionUsers);
router.post("/:id/reactions", authRequired, reactToPost);
router.patch(
    "/:id",
    optionalAuth,
    uploadPostImage.single("imageFile"),
    patchPost,
);
router.delete("/:id", authRequired, deletePost);
router.patch("/:id/featured", authRequired, adminOnly, setFeatured);

router.get("/:id/comments", listComments);
router.post("/:id/comments", authRequired, createComment);
router.post("/:id/comments/:commentId/vote", authRequired, voteComment);

export default router;
