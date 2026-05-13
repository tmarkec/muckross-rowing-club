import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/coaches/")({
  head: () => ({ meta: [{ title: "Coaches Corner — Muckross RC" }, { name: "robots", content: "noindex" }] }),
  component: CoachesHome,
});

function CoachesHome() {
  const { loading, session, isAdmin, isCoach, user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/coaches/login" });
  }, [loading, session, navigate]);

  if (loading || !session) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="font-serif text-3xl">Coaches Corner</h1>
            <p className="text-sm text-muted-foreground mt-1">Signed in as {user?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={async () => { await signOut(); void navigate({ to: "/coaches/login" }); }}>Sign out</Button>
        </div>

        {!isCoach && !isAdmin ? (
          <div className="rounded-lg border bg-background p-6">
            <h2 className="font-serif text-xl">No access yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account hasn't been assigned a coach role. Ask an admin to add you.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border bg-background p-6">
            <h2 className="font-serif text-xl">Welcome</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Authentication is set up. The admin panel, group management, and attendance tools are coming next — I'll wire them up in the next message.
            </p>
            {isAdmin && (
              <p className="mt-3 text-sm">
                You have <span className="font-medium">admin</span> access.
              </p>
            )}
            <div className="mt-6">
              <Link to="/" className="text-sm text-muted-foreground hover:underline">← Back to club site</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}