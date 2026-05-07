import { Server } from "socket.io";

let ioInstance = null;

export function initSocket(httpServer, clientOrigin) {
    ioInstance = new Server(httpServer, {
        cors: {
            origin: clientOrigin,
            credentials: true,
        },
    });

    ioInstance.on("connection", (socket) => {
        socket.on("post:join", (postId) => {
            if (!postId) return;
            socket.join(`post:${postId}`);
        });

        socket.on("post:leave", (postId) => {
            if (!postId) return;
            socket.leave(`post:${postId}`);
        });
    });

    return ioInstance;
}

export function getSocket() {
    return ioInstance;
}

export function emitSocket(eventName, payload) {
    if (!ioInstance) return;
    ioInstance.emit(eventName, payload);
}

export function emitSocketToPost(postId, eventName, payload) {
    if (!ioInstance || !postId) return;
    ioInstance.to(`post:${postId}`).emit(eventName, payload);
}
