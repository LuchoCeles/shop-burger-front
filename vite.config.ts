import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargamos las variables de entorno del archivo .env
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
      allowedHosts: [
        "localhost",
        "127.0.0.1",
        env.VITE_API_URL?.replace(/^https?:\/\//, ""), // 🔥 limpia el dominio
      ],
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});