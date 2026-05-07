import Post from "../models/Post.js";
import { toPublicPost, toPublicUser } from "../utils/serializers.js";
import { emitSocket } from "../realtime/socket.js";

const populateAuthor = { path: "author", select: "name userPic" };

function parseIntParam(value, fallback) {
    const n = Number.parseInt(String(value), 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function listPosts(req, res) {
    const viewerUserId = req.user?.id || "";
    const page = parseIntParam(req.query.page, 1);
    const limit = Math.min(parseIntParam(req.query.limit, 10), 50);
    const search = String(req.query.search || "").trim();
    const sortOrder = req.query.sort === "oldest" ? 1 : -1;

    const filter = {};
    if (search) {
        filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    let query = Post.find(filter).skip(skip).limit(limit).populate(populateAuthor);
    if (search) {
        query = query.select({ score: { $meta: "textScore" } });
        query = query.sort({ score: { $meta: "textScore" } });
    } else {
        query = query.sort({ date: sortOrder });
    }

    const [total, docs] = await Promise.all([
        Post.countDocuments(filter),
        query.exec(),
    ]);

    const posts = docs.map((d) => toPublicPost(d, "", viewerUserId));
    res.json({
        posts,
        page,
        pages: Math.max(1, Math.ceil(total / limit)),
        total,
        limit,
    });
}

export async function featuredPosts(req, res) {
    const viewerUserId = req.user?.id || "";
    const limit = Math.min(parseIntParam(req.query.limit, 3), 10);
    const docs = await Post.find({ featured: true })
        .sort({ date: -1 })
        .limit(limit)
        .populate(populateAuthor)
        .exec();

    const posts = docs.length
        ? docs.map((d) => toPublicPost(d, "", viewerUserId))
        : (
              await Post.find({})
                  .sort({ date: -1 })
                  .limit(limit)
                  .populate(populateAuthor)
                  .exec()
          ).map((d) => toPublicPost(d, "", viewerUserId));

    res.json(posts);
}

export async function myPosts(req, res) {
    const viewerUserId = req.user?.id || "";
    const page = parseIntParam(req.query.page, 1);
    const limit = Math.min(parseIntParam(req.query.limit, 10), 50);
    const skip = (page - 1) * limit;

    const filter = { author: req.user.id };
    const [total, docs] = await Promise.all([
        Post.countDocuments(filter),
        Post.find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate(populateAuthor)
            .exec(),
    ]);

    res.json({
        posts: docs.map((d) => toPublicPost(d, "", viewerUserId)),
        page,
        pages: Math.max(1, Math.ceil(total / limit)),
        total,
        limit,
    });
}

export async function getPost(req, res) {
    const viewerUserId = req.user?.id || "";
    const post = await Post.findById(req.params.id).populate(populateAuthor);
    if (!post) {
        return res.status(404).json({ message: "Not found" });
    }
    post.views = (post.views || 0) + 1;
    await post.save();
    res.json(toPublicPost(post, "", viewerUserId));
}

export async function createPost(req, res) {
    const title = String(req.body.title || "").trim();
    const category = String(req.body.category || "").trim();
    const description = String(req.body.description || "").trim();
    const content = String(req.body.content || "").trim();

    let image = String(req.body.image || req.body.imageUrl || "").trim();
    if (req.file) {
        image = `/uploads/${req.file.filename}`;
    }

    if (!title || !category || !description || !content || !image) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const post = await Post.create({
        title,
        author: req.user.id,
        category,
        description,
        content,
        image,
        date: new Date(),
    });

    const populated = await Post.findById(post._id).populate(populateAuthor);
    const created = toPublicPost(populated);
    emitSocket("post:created", { post: created, actorId: req.user?.id || "" });
    res.status(201).json(created);
}

export async function patchPost(req, res) {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: "Not found" });
    }

    const keys = Object.keys(req.body || {});
    const reactionOnly =
        keys.length > 0 &&
        keys.every((k) => k === "likes" || k === "dislikes");

    if (reactionOnly) {
        if (req.body.likes !== undefined) post.likes = Number(req.body.likes);
        if (req.body.dislikes !== undefined)
            post.dislikes = Number(req.body.dislikes);
        await post.save();
        const populated = await Post.findById(post._id).populate(populateAuthor);
        return res.json(toPublicPost(populated));
    }

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const isOwner = post.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
    }

    const allowed = ["title", "category", "description", "content", "image"];
    for (const key of allowed) {
        if (req.body[key] !== undefined) {
            post[key] = req.body[key];
        }
    }
    if (req.body.imageUrl !== undefined) {
        post.image = req.body.imageUrl;
    }
    if (req.file) {
        post.image = `/uploads/${req.file.filename}`;
    }

    await post.save();
    const populated = await Post.findById(post._id).populate(populateAuthor);
    const updated = toPublicPost(populated);
    emitSocket("post:updated", { post: updated, actorId: req.user?.id || "" });
    res.json(updated);
}

function upsertReactionUser(post, userId, type) {
    const likedSet = new Set((post.likedBy || []).map((u) => u.toString()));
    const dislikedSet = new Set((post.dislikedBy || []).map((u) => u.toString()));

    const wantsLike = type === "like";
    const wantsDislike = type === "dislike";
    if (!wantsLike && !wantsDislike) return { reaction: null, likedDelta: 0, dislikedDelta: 0 };

    let likesDelta = 0;
    let dislikesDelta = 0;

    const isLiked = likedSet.has(userId);
    const isDisliked = dislikedSet.has(userId);

    if (wantsLike) {
        // Toggle off if already liked
        if (isLiked) {
            likedSet.delete(userId);
            likesDelta -= 1;
        } else {
            // Switch from dislike -> like
            if (isDisliked) {
                dislikedSet.delete(userId);
                dislikesDelta -= 1;
            }
            likedSet.add(userId);
            likesDelta += 1;
        }
    }

    if (wantsDislike) {
        // Toggle off if already disliked
        if (isDisliked) {
            dislikedSet.delete(userId);
            dislikesDelta -= 1;
        } else {
            // Switch from like -> dislike
            if (isLiked) {
                likedSet.delete(userId);
                likesDelta -= 1;
            }
            dislikedSet.add(userId);
            dislikesDelta += 1;
        }
    }

    return {
        reaction: likedSet.has(userId) ? "like" : dislikedSet.has(userId) ? "dislike" : null,
        likedIds: [...likedSet],
        dislikedIds: [...dislikedSet],
        likesDelta,
        dislikesDelta,
    };
}

export async function reactToPost(req, res) {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });

    if (post.author?.toString?.() === req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
    }

    const type = String(req.body?.type || "").trim();
    if (type !== "like" && type !== "dislike") {
        return res.status(400).json({ message: "Invalid reaction type" });
    }

    const userId = req.user.id;
    const result = upsertReactionUser(post, userId, type);

    // Keep likes/dislikes numbers stable even if likedBy/dislikedBy arrays were empty historically.
    post.likes = Math.max(0, Number(post.likes || 0) + result.likesDelta);
    post.dislikes = Math.max(0, Number(post.dislikes || 0) + result.dislikesDelta);

    post.likedBy = result.likedIds;
    post.dislikedBy = result.dislikedIds;

    await post.save();
    emitSocket("post:reacted", {
        postId: post._id.toString(),
        likes: post.likes,
        dislikes: post.dislikes,
        actorId: req.user?.id || "",
    });
    res.json({ likes: post.likes, dislikes: post.dislikes, reaction: result.reaction });
}

export async function listPostReactionUsers(req, res) {
    const post = await Post.findById(req.params.id).populate([
        { path: "likedBy", select: "name userPic" },
        { path: "dislikedBy", select: "name userPic" },
    ]);
    if (!post) return res.status(404).json({ message: "Not found" });

    res.json({
        likes: post.likes ?? post.likedBy?.length ?? 0,
        dislikes: post.dislikes ?? post.dislikedBy?.length ?? 0,
        likedBy: (post.likedBy || []).map((u) => toPublicUser(u)),
        dislikedBy: (post.dislikedBy || []).map((u) => toPublicUser(u)),
    });
}

export async function setFeatured(req, res) {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: "Not found" });
    }
    post.featured = Boolean(req.body.featured);
    await post.save();
    const populated = await Post.findById(post._id).populate(populateAuthor);
    const updated = toPublicPost(populated);
    emitSocket("post:updated", { post: updated, actorId: req.user?.id || "" });
    res.json(updated);
}

export async function deletePost(req, res) {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: "Not found" });
    }

    const isOwner = post.author.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
    }

    const postId = post._id.toString();
    await Post.deleteOne({ _id: post._id });
    emitSocket("post:deleted", { postId, actorId: req.user?.id || "" });
    res.json({ ok: true });
}

export async function listAllForAdmin(req, res) {
    const viewerUserId = req.user?.id || "";
    const page = parseIntParam(req.query.page, 1);
    const limit = Math.min(parseIntParam(req.query.limit, 20), 100);
    const skip = (page - 1) * limit;

    const [total, docs] = await Promise.all([
        Post.countDocuments({}),
        Post.find({})
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit)
            .populate(populateAuthor)
            .exec(),
    ]);

    res.json({
        posts: docs.map((d) => toPublicPost(d, "", viewerUserId)),
        page,
        pages: Math.max(1, Math.ceil(total / limit)),
        total,
        limit,
    });
}
