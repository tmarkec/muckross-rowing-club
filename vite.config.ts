import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

export default defineConfig({
  // Register Nitro directly so the deployment platform is detected automatically.
  nitro: false,
  plugins: [nitro()],
});
