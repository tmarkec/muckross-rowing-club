import { createStart } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/lib/supabase-auth";

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
}));
