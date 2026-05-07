import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { getAuthCookieOptions } from "../utils/cookieOptions.js";
import { getCookieName, signAccessToken, verifyAccessToken } from "../utils/token.js";
import { toPublicUser } from "../utils/serializers.js";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function setAuthCookie(res, userId, role) {
    const token = signAccessToken(userId, role);
    res.cookie(getCookieName(), token, getAuthCookieOptions(WEEK_MS));
}

export async function register(req, res) {
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
    let userPic = String(req.body.userPic || "").trim();

    if (req.file) {
        userPic = `/uploads/${req.file.filename}`;
    }

    const user = await User.create({
        name,
        email,
        password: hash,
        role: "user",
        userPic,
    });

    setAuthCookie(res, user._id.toString(), user.role);
    const fresh = await User.findById(user._id);
    res.status(201).json({ user: toPublicUser(fresh) });
}

export async function login(req, res) {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return res.status(401).json({ message: "auth.invalidCredentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        return res.status(401).json({ message: "auth.invalidCredentials" });
    }

    setAuthCookie(res, user._id.toString(), user.role);
    const fresh = await User.findById(user._id);
    res.json({ user: toPublicUser(fresh) });
}

export async function logout(_req, res) {
    res.clearCookie(getCookieName(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/",
    });
    res.json({ ok: true });
}

export async function session(req, res) {
    const token = req.cookies?.[getCookieName()];
    if (!token) {
        return res.json({ authenticated: false, user: null });
    }
    try {
        const payload = verifyAccessToken(token);
        return res.json({
            authenticated: true,
            user: {
                id: payload.sub,
                role: payload.role,
            },
        });
    } catch {
        return res.json({ authenticated: false, user: null });
    }
}

export async function me(req, res) {
    const token = req.cookies?.[getCookieName()];
    if (!token) {
        return res.json({ user: null });
    }

    let payload;
    try {
        payload = verifyAccessToken(token);
    } catch {
        return res.json({ user: null });
    }

    try {
        const user = await User.findById(payload.sub);
        if (!user) {
            return res.json({ user: null });
        }
        return res.json({ user: toPublicUser(user) });
    } catch {
        const err = new Error("auth.serverUnavailable");
        err.status = 503;
        throw err;
    }
}
