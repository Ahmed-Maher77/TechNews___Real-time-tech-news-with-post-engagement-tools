import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import { toPublicComment } from "../utils/serializers.js";

export async function listComments(req, res) {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: "Not found" });
    }

    const comments = await Comment.find({ post: post._id })
        .sort({ createdAt: -1 })
        .populate({ path: "user", select: "name userPic" })
        .exec();

    res.json(comments.map((c) => toPublicComment(c)));
}

export async function createComment(req, res) {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: "Not found" });
    }

    const text = String(req.body.text || "").trim();
    if (!text) {
        return res.status(400).json({ message: "Comment text required" });
    }

    const comment = await Comment.create({
        post: post._id,
        user: req.user.id,
        text,
    });

    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    const populated = await Comment.findById(comment._id).populate({
        path: "user",
        select: "name userPic",
    });

    res.status(201).json(toPublicComment(populated));
}

export async function voteComment(req, res) {
    const { type } = req.body;
    if (type !== "upvote" && type !== "downvote") {
        return res.status(400).json({ message: "Invalid vote" });
    }

    const comment = await Comment.findOne({
        _id: req.params.commentId,
        post: req.params.id,
    });
    if (!comment) {
        return res.status(404).json({ message: "Not found" });
    }

    if (type === "upvote") {
        comment.upvotes = (comment.upvotes || 0) + 1;
    } else {
        comment.downvotes = (comment.downvotes || 0) + 1;
    }
    await comment.save();

    const populated = await Comment.findById(comment._id).populate({
        path: "user",
        select: "name userPic",
    });
    res.json(toPublicComment(populated));
}
