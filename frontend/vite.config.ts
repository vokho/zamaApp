import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "window",
  },
  resolve: {
    alias: {
      "isomorphic-unfetch": "cross-fetch",
      unfetch: "cross-fetch",
    },
  },
  optimizeDeps: {
    include: ["relayer-sdk", "cross-fetch"],
  },
});
