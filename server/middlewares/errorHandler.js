export function errorHandler(err, _req, res, next) {
    void next;
    let status = err.status || err.statusCode || 500;
    let message = status === 500 ? "Internal server error" : err.message || "Error";

    const rawMessage = String(err?.message || "");
    const isDbConnectivityIssue =
        rawMessage.includes("querySrv ECONNREFUSED") ||
        rawMessage.includes("buffering timed out") ||
        rawMessage.includes("before initial connection is complete") ||
        rawMessage.includes("bufferCommands = false") ||
        rawMessage.includes("ECONNREFUSED") ||
        rawMessage.includes("Mongo") ||
        rawMessage.includes("Mongoose");

    if (isDbConnectivityIssue) {
        status = 503;
        message = "auth.serverUnavailable";
    }

    if (status === 500) {
        console.error(err);
    }
    res.status(status).json({ message });
}
