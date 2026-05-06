import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
    root: __dirname,
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
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
        },
    },
});
