import { io } from "socket.io-client";

let socketInstance = null;

function getSocketBaseUrl() {
    const apiBase = import.meta.env.VITE_API_BASE_URL;
    if (apiBase) return apiBase.replace(/\/api\/?$/, "");
    return window.location.origin;
}

export function getSocket() {
    if (socketInstance) return socketInstance;
    socketInstance = io(getSocketBaseUrl(), {
        path: "/socket.io",
        withCredentials: true,
        transports: ["websocket", "polling"],
    });
    return socketInstance;
}
