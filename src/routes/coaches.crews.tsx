import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import RegattaLineupBoard from "@/components/RegattaLineupBoard";

export const Route = createFileRoute("/coaches/crews")({
  head: () => ({ meta: [{ title: "Crew selection — Coaches Corner" }, { name: "robots", content: "noindex" }] }),
  component: CrewsPage,
});

function CrewsPage() {
  const { loading, session, isCoach, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/coaches/login" });
  }, [loading, session, navigate]);

  if (loading || !session) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!isCoach && !isAdmin) return <div className="min-h-screen flex items-center justify-center">Not authorised.</div>;

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8 print:bg-white print:py-0 print:px-0">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between gap-3 flex-wrap print:hidden">
          <div>
            <h1 className="font-serif text-3xl">Crew selection</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Build regatta lineups in local memory. Download as PDF or reset — nothing is saved to the database.
            </p>
          </div>
          <Button asChild size="sm" variant="outline"><Link to="/coaches">← Coaches Corner</Link></Button>
        </div>
        <RegattaLineupBoard />
      </div>
    </div>
  );
}