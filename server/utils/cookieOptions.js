export function getAuthCookieOptions(maxAgeMs) {
    const isProd = process.env.NODE_ENV === "production";
    return {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
        maxAge: maxAgeMs,
        path: "/",
    };
}
