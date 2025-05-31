
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { componentTagger } from "lovable-tagger";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      tsconfigPaths({ projects: ["./tsconfig.loveable.json"] }),
      ...(mode === "development" ? [componentTagger()] : [])
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client/src"),
      },
    },
  };
});
