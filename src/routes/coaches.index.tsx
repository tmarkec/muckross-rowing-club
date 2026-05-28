import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Group = { id: string; name: string; description: string | null };

export const Route = createFileRoute("/coaches/")({
  head: () => ({ meta: [{ title: "Coaches Corner — Muckross RC" }, { name: "robots", content: "noindex" }] }),
  component: CoachesHome,
});

function CoachesHome() {
  const { loading, session, isAdmin, isCoach, user, signOut } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/coaches/login" });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!session || (!isCoach && !isAdmin)) return;
    setLoadingGroups(true);
    void supabase
      .from("groups")
      .select("id, name, description")
      .order("name")
      .then(({ data }) => {
        setGroups(data ?? []);
        setLoadingGroups(false);
      });
  }, [session, isCoach, isAdmin]);

  if (loading || !session) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-between items-start mb-8 gap-3 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl">Coaches Corner</h1>
            <p className="text-sm text-muted-foreground mt-1">Signed in as {user?.email}</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button asChild size="sm" variant="default">
                <Link to="/coaches/admin">Admin panel</Link>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={async () => { await signOut(); void navigate({ to: "/coaches/login" }); }}>Sign out</Button>
          </div>
        </div>

        {!isCoach && !isAdmin ? (
          <div className="rounded-lg border bg-background p-6">
            <h2 className="font-serif text-xl">No access yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account hasn't been assigned a coach role. Ask an admin to add you.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-serif text-xl">Your groups</h2>
            {loadingGroups ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : groups.length === 0 ? (
              <div className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">
                {isAdmin
                  ? "No groups yet. Create one in the admin panel."
                  : "You haven't been assigned to any groups yet. Ask an admin."}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {groups.map((g) => (
                  <Link
                    key={g.id}
                    to="/coaches/groups/$groupId"
                    params={{ groupId: g.id }}
                    className="block rounded-lg border bg-background p-5 hover:border-primary hover:shadow-sm transition"
                  >
                    <div className="font-serif text-lg">{g.name}</div>
                    {g.description && <div className="text-sm text-muted-foreground mt-1">{g.description}</div>}
                  </Link>
                ))}
              </div>
            )}
            <div className="pt-4">
              <Link to="/" className="text-sm text-muted-foreground hover:underline">← Back to club site</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}