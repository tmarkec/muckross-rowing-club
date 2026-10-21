import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LakeNavigationRules } from "@/components/LakeNavigationRules";

export const Route = createFileRoute("/coaches/traffic")({
  head: () => ({ meta: [{ title: "Traffic rules — Coaches Corner" }, { name: "robots", content: "noindex" }] }),
  component: TrafficPage,
});

function TrafficPage() {
  const { loading, session, isCoach, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/coaches/login" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl">Traffic Rules</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Official circulation patterns, safety boat positions, and navigation guidelines for water sessions on the lake.
            </p>
          </div>
          <Button asChild size="sm" variant="outline"><Link to="/coaches">← Coaches Corner</Link></Button>
        </div>

        {isCoach || isAdmin ? (
          <LakeNavigationRules />
        ) : (
          <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
            Your account hasn't been assigned a coach role. Ask an admin to add you.
          </div>
        )}
      </div>
    </div>
  );
}
