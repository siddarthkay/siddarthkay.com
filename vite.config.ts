import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { execSync } from "child_process";

const commitSha = (() => {
  try { return execSync("git rev-parse --short HEAD").toString().trim(); }
  catch { return "dev"; }
})();

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  define: {
    __BUILD_SHA__: JSON.stringify(commitSha),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_URL__: JSON.stringify(
      process.env.GITHUB_RUN_ID
        ? "https://github.com/" + (process.env.GITHUB_REPOSITORY || "siddarthkay/siddarthkay.com") + "/actions/runs/" + process.env.GITHUB_RUN_ID
        : ""
    ),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
