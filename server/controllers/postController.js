import Post from "../models/Post.js";
import { toPublicPost } from "../utils/serializers.js";

const populateAuthor = { path: "author", select: "name userPic" };

function parseIntParam(value, fallback) {
    const n = Number.parseInt(String(value), 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function listPosts(req, res) {
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

    const posts = docs.map((d) => toPublicPost(d));
    res.json({
        posts,
        page,
        pages: Math.max(1, Math.ceil(total / limit)),
        total,
        limit,
    });
}

export async function featuredPosts(req, res) {
    const limit = Math.min(parseIntParam(req.query.limit, 3), 10);
    const docs = await Post.find({ featured: true })
        .sort({ date: -1 })
        .limit(limit)
        .populate(populateAuthor)
        .exec();

    const posts = docs.length
        ? docs.map((d) => toPublicPost(d))
        : (
              await Post.find({})
                  .sort({ date: -1 })
                  .limit(limit)
                  .populate(populateAuthor)
                  .exec()
          ).map((d) => toPublicPost(d));

    res.json(posts);
}

export async function myPosts(req, res) {
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
        posts: docs.map((d) => toPublicPost(d)),
        page,
        pages: Math.max(1, Math.ceil(total / limit)),
        total,
        limit,
    });
}

export async function getPost(req, res) {
    const post = await Post.findById(req.params.id).populate(populateAuthor);
    if (!post) {
        return res.status(404).json({ message: "Not found" });
    }
    post.views = (post.views || 0) + 1;
    await post.save();
    res.json(toPublicPost(post));
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
    res.status(201).json(toPublicPost(populated));
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

    await post.save();
    const populated = await Post.findById(post._id).populate(populateAuthor);
    res.json(toPublicPost(populated));
}

export async function setFeatured(req, res) {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message: "Not found" });
    }
    post.featured = Boolean(req.body.featured);
    await post.save();
    const populated = await Post.findById(post._id).populate(populateAuthor);
    res.json(toPublicPost(populated));
}

export async function listAllForAdmin(req, res) {
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
        posts: docs.map((d) => toPublicPost(d)),
        page,
        pages: Math.max(1, Math.ceil(total / limit)),
        total,
        limit,
    });
}
