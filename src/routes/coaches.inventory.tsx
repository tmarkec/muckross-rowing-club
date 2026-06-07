import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { InventoryManager } from "@/components/InventoryManager";

export const Route = createFileRoute("/coaches/inventory")({
  head: () => ({ meta: [{ title: "Boats & Oars — Coaches Corner" }, { name: "robots", content: "noindex" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const { loading, session, isCoach, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [groupNames, setGroupNames] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/coaches/login" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const { data } = await supabase
        .from("group_coaches")
        .select("groups(name)")
        .eq("coach_user_id", user.id);
      const names = ((data ?? []) as Array<{ groups: { name: string } | null }>)
        .map((r) => r.groups?.name).filter((n): n is string => !!n);
      setGroupNames(names);
    })();
  }, [user]);

  if (loading || !session) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!isCoach && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        You don't have access to this page.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl">Boats & Oars</h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin ? "Admin: bulk add and manage all club boats & oars." : "Read-only view of club boats & oars."}
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/coaches">← Dashboard</Link>
          </Button>
        </div>
        <InventoryManager coachGroupNames={groupNames} />
      </div>
    </div>
  );
}