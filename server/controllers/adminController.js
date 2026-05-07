import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import { toPublicUser } from "../utils/serializers.js";
import { toPublicPost } from "../utils/serializers.js";
import { emitSocket } from "../realtime/socket.js";

export async function createAdmin(req, res) {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Missing fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(409).json({ message: "auth.emailExists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email,
        password: hash,
        role: "admin",
        userPic: "",
    });

    res.status(201).json({ user: toPublicUser(user) });
}

function parseIntParam(value, fallback) {
    const n = Number.parseInt(String(value), 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function listModerationPosts(req, res) {
    const page = parseIntParam(req.query.page, 1);
    const limit = Math.min(parseIntParam(req.query.limit, 20), 100);
    const status = String(req.query.status || "pending");
    const search = String(req.query.search || "").trim();
    const sort = String(req.query.sort || "newest").trim();
    const allowed = new Set(["pending", "approved", "rejected", "all"]);
    const normalizedStatus = allowed.has(status) ? status : "pending";
    const filter =
        normalizedStatus === "all"
            ? {}
            : { moderationStatus: normalizedStatus };
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }
    const skip = (page - 1) * limit;
    const sortMap = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        title_asc: { title: 1 },
        title_desc: { title: -1 },
    };
    const sortStage = sortMap[sort] || sortMap.newest;

    const [total, docs] = await Promise.all([
        Post.countDocuments(filter),
        Post.find(filter)
            .sort(sortStage)
            .skip(skip)
            .limit(limit)
            .populate({ path: "author", select: "name userPic" })
            .exec(),
    ]);

    res.json({
        posts: docs.map((d) => toPublicPost(d)),
        page,
        pages: Math.max(1, Math.ceil(total / limit)),
        total,
        limit,
        status: normalizedStatus,
        search,
        sort,
    });
}

export async function listUsers(req, res) {
    const page = parseIntParam(req.query.page, 1);
    const limit = Math.min(parseIntParam(req.query.limit, 15), 100);
    const search = String(req.query.search || "").trim();
    const sort = String(req.query.sort || "newest").trim();
    const skip = (page - 1) * limit;
    const filter = {};
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }
    const sortMap = {
        newest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        name_asc: { name: 1 },
        name_desc: { name: -1 },
        email_asc: { email: 1 },
        email_desc: { email: -1 },
    };
    const sortStage = sortMap[sort] || sortMap.newest;

    const [total, docs] = await Promise.all([
        User.countDocuments(filter),
        User.find(filter)
            .sort(sortStage)
            .skip(skip)
            .limit(limit)
            .exec(),
    ]);

    res.json({
        users: docs.map((user) => {
            const publicUser = toPublicUser(user);
            return {
                ...publicUser,
                createdAt: user.createdAt || null,
            };
        }),
        page,
        pages: Math.max(1, Math.ceil(total / limit)),
        total,
        limit,
        search,
        sort,
    });
}

export async function moderatePost(req, res) {
    const post = await Post.findById(req.params.id).populate({
        path: "author",
        select: "name userPic",
    });
    if (!post) return res.status(404).json({ message: "Not found" });

    const nextStatus = String(req.body?.status || "").trim();
    if (nextStatus !== "approved" && nextStatus !== "rejected") {
        return res.status(400).json({ message: "Invalid status" });
    }

    post.moderationStatus = nextStatus;
    await post.save();
    const updated = toPublicPost(post);
    emitSocket("post:updated", { post: updated, actorId: req.user?.id || "" });
    res.json(updated);
}

export async function deleteUser(req, res) {
    const userId = String(req.params.id || "").trim();
    if (!userId) return res.status(400).json({ message: "Invalid user id" });
    if (String(req.user?.id || "") === userId) {
        return res.status(400).json({ message: "admin.cannotDeleteSelf" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Not found" });

    const userPosts = await Post.find({ author: userId }).select("_id").lean();
    const userPostIds = userPosts.map((post) => post._id);

    await Promise.all([
        Post.deleteMany({ author: userId }),
        Comment.deleteMany({
            $or: [{ user: userId }, { post: { $in: userPostIds } }],
        }),
        User.findByIdAndDelete(userId),
    ]);

    res.json({ ok: true, id: userId });
}

function lastNDates(days) {
    const now = new Date();
    const list = [];
    for (let i = days - 1; i >= 0; i -= 1) {
        const date = new Date(now);
        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() - i);
        list.push(date);
    }
    return list;
}

export async function getDashboardStats(_req, res) {
    const [users, admins, posts, pending, approved, rejected] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ role: "admin" }),
        Post.countDocuments({}),
        Post.countDocuments({ moderationStatus: "pending" }),
        Post.countDocuments({ moderationStatus: "approved" }),
        Post.countDocuments({ moderationStatus: "rejected" }),
    ]);

    const dates = lastNDates(7);
    const startDate = dates[0];
    const byDayAgg = await Post.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
            $group: {
                _id: {
                    y: { $year: "$createdAt" },
                    m: { $month: "$createdAt" },
                    d: { $dayOfMonth: "$createdAt" },
                },
                count: { $sum: 1 },
            },
        },
    ]);

    const countByKey = new Map(
        byDayAgg.map((item) => [
            `${item._id.y}-${String(item._id.m).padStart(2, "0")}-${String(item._id.d).padStart(2, "0")}`,
            item.count,
        ]),
    );

    const postsByDay = dates.map((date) => {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        return {
            date: key,
            label: date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
            count: countByKey.get(key) || 0,
        };
    });

    const recentPendingDocs = await Post.find({ moderationStatus: "pending" })
        .sort({ createdAt: -1 })
        .limit(2)
        .populate({ path: "author", select: "name userPic" })
        .exec();

    const reviewed = approved + rejected;
    const approvalRate = reviewed > 0 ? Math.round((approved / reviewed) * 100) : 0;

    res.json({
        overview: {
            users,
            admins,
            posts,
        },
        moderation: {
            pending,
            approved,
            rejected,
        },
        postsByDay,
        quality: {
            reviewed,
            approvalRate,
        },
        recentPendingTotal: pending,
        recentPending: recentPendingDocs.map((d) => toPublicPost(d)),
    });
}
