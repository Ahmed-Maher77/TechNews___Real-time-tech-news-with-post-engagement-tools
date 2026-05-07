import net from "node:net";
import { spawn } from "node:child_process";

const port = Number.parseInt(process.env.PORT || "5000", 10);
const host = process.env.HOST || "127.0.0.1";

function isPortBusy(targetPort, targetHost) {
    return new Promise((resolve) => {
        const socket = net.createConnection({
            port: targetPort,
            host: targetHost,
        });
        socket.setTimeout(750);
        socket.once("connect", () => {
            socket.destroy();
            resolve(true);
        });
        socket.once("timeout", () => {
            socket.destroy();
            resolve(false);
        });
        socket.once("error", (error) => {
            if (error?.code === "ECONNREFUSED" || error?.code === "EHOSTUNREACH") {
                resolve(false);
                return;
            }
            resolve(true);
        });
    });
}

const busy = await isPortBusy(port, host);
if (busy) {
    console.log(
        `[dev-guard] Port ${port} is already in use. Another backend instance is likely running.`,
    );
    console.log("[dev-guard] Skipping duplicate dev server startup.");
    process.exit(0);
}

const child = spawn("node", ["--watch", "index.js"], {
    stdio: "inherit",
    shell: true,
});

child.on("exit", (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal);
        return;
    }
    process.exit(code ?? 0);
});
