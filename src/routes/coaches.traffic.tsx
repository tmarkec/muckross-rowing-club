import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
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
        <Link to="/coaches" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Coaches Corner
        </Link>
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
