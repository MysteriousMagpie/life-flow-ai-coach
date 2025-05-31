
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// Custom plugin to resolve components from multiple locations
const multiLocationResolver = () => ({
  name: 'multi-location-resolver',
  resolveId(id: string, importer: string) {
    if (id.startsWith('@/components/')) {
      const componentName = id.replace('@/components/', '');
      
      // First try local components directory
      const localPath = path.resolve(__dirname, './src/components', `${componentName}.tsx`);
      if (fs.existsSync(localPath)) {
        return localPath;
      }
      
      // Also try with .ts extension
      const localPathTs = path.resolve(__dirname, './src/components', `${componentName}.ts`);
      if (fs.existsSync(localPathTs)) {
        return localPathTs;
      }
      
      // Then try root components directory
      const rootPath = path.resolve(__dirname, '../components', `${componentName}.tsx`);
      if (fs.existsSync(rootPath)) {
        return rootPath;
      }
      
      // Also try root with .ts extension
      const rootPathTs = path.resolve(__dirname, '../components', `${componentName}.ts`);
      if (fs.existsSync(rootPathTs)) {
        return rootPathTs;
      }
    }
    return null;
  }
});

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    multiLocationResolver(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
