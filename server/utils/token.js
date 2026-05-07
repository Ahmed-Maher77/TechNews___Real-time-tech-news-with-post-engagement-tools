import jwt from "jsonwebtoken";

const COOKIE_NAME = "accessToken";

export function getCookieName() {
    return COOKIE_NAME;
}

export function signAccessToken(userId, role) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    return jwt.sign({ sub: userId, role }, secret, { expiresIn });
}

export function verifyAccessToken(token) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");
    return jwt.verify(token, secret);
}
