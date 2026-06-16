import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Ruler, Gauge, CalendarRange, Anchor, Users, ShieldCheck, LogOut, Download, CalendarDays } from "lucide-react";

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
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl sm:text-3xl">Coaches Corner</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">Signed in as {user?.email}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={async () => { await signOut(); void navigate({ to: "/coaches/login" }); }}
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>

        {(isCoach || isAdmin) && (
          <>
          <nav aria-label="Coach tools" className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { to: "/coaches/rigging", label: "Rigging", icon: Ruler },
              { to: "/coaches/pace", label: "Pace calculator", icon: Gauge },
              { to: "/coaches/program", label: "Training program", icon: CalendarRange },
              { to: "/coaches/crews", label: "Crew selection", icon: Users },
              { to: "/coaches/inventory", label: "Boats & oars", icon: Anchor },
              { to: "/coaches/schedule", label: "Group schedule", icon: CalendarDays },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition hover:border-primary hover:bg-muted"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span className="truncate">{label}</span>
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/coaches/admin"
                className="flex items-center gap-2 rounded-lg border border-primary bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="truncate">Admin panel</span>
              </Link>
            )}
          </nav>
          <div className="mb-8">
            <a
              href="/MRC-rowing-drills.pdf"
              download="MRC-rowing-drills.pdf"
              className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span>📥 Download drills card</span>
            </a>
          </div>
          </>
        )}

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