import { getCookieName, verifyAccessToken } from "../utils/token.js";

export function optionalAuth(req, _res, next) {
    const token = req.cookies?.[getCookieName()];
    if (!token) {
        req.user = null;
        return next();
    }
    try {
        const payload = verifyAccessToken(token);
        req.user = {
            id: payload.sub,
            role: payload.role,
        };
    } catch {
        req.user = null;
    }
    next();
}

export function authRequired(req, res, next) {
    const token = req.cookies?.[getCookieName()];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const payload = verifyAccessToken(token);
        req.user = {
            id: payload.sub,
            role: payload.role,
        };
        next();
    } catch {
        return res.status(401).json({ message: "Unauthorized" });
    }
}

export function adminOnly(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
    }
    next();
}
