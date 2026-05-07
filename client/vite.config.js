import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
    root: __dirname,
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
    resolve: {
        dedupe: ["react", "react-dom"],
        alias: {
            react: resolve(__dirname, "node_modules/react"),
            "react-dom": resolve(__dirname, "node_modules/react-dom"),
        },
    },
    server: {
        open: true,
        proxy: {
            "/api": {
                target: "http://localhost:5000",
                changeOrigin: true,
            },
            "/uploads": {
                target: "http://localhost:5000",
                changeOrigin: true,
            },
            "/socket.io": {
                target: "http://localhost:5000",
                ws: true,
                changeOrigin: true,
            },
        },
    },
});
