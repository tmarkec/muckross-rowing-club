import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  // Register Nitro directly so the deployment platform is detected automatically.
  nitro: false,
  plugins: [nitro()],
  resolve: {
    alias: {
      "@/integrations/supabase/client": fileURLToPath(
        new URL("./src/lib/supabase.ts", import.meta.url),
      ),
    },
  },
});
