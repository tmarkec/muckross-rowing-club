import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import CoachesPaceCalculator from "@/components/CoachesPaceCalculator";

export const Route = createFileRoute("/coaches/pace")({
  head: () => ({ meta: [{ title: "Pace calculator — Coaches Corner" }, { name: "robots", content: "noindex" }] }),
  component: PacePage,
});

function PacePage() {
  const { loading, session, isCoach, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/coaches/login" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }
  if (!isCoach && !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Not authorised.</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl">Pace calculator</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Concept2 power-based training zones from any 2 km erg target.
            </p>
          </div>
          <Button asChild size="sm" variant="outline"><Link to="/coaches">← Coaches Corner</Link></Button>
        </div>

        <CoachesPaceCalculator />
      </div>
    </div>
  );
}