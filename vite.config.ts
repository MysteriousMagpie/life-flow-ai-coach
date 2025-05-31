
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";
import type { PluginContext } from "rollup";

// Custom plugin to resolve components from multiple locations
const multiLocationResolver = () => ({
  name: 'multi-location-resolver',
  resolveId(this: PluginContext, source: string, importer?: string) {
    if (source.startsWith('@/components/')) {
      const componentName = source.replace('@/components/', '');
      
      // First try client components directory
      const clientPath = path.resolve(__dirname, './client/src/components', `${componentName}.tsx`);
      if (fs.existsSync(clientPath)) {
        return clientPath;
      }
      
      // Also try with .ts extension
      const clientPathTs = path.resolve(__dirname, './client/src/components', `${componentName}.ts`);
      if (fs.existsSync(clientPathTs)) {
        return clientPathTs;
      }
    }
    return null;
  }
});

export default defineConfig(({ mode }) => {
  const plugins = [react(), multiLocationResolver()];
  
  if (mode === "development") {
    plugins.push(componentTagger());
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client/src"),
      },
    },
  };
});
