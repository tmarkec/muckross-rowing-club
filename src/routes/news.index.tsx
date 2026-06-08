import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, MapPin, ExternalLink } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import heroAsset from "@/assets/hero-juniors-group.jpg.asset.json";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { WeatherWidget } from "@/components/WeatherWidget";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: "News & Updates — Muckross Rowing Club" },
      { name: "description", content: "Latest news, race results and announcements from Muckross Rowing Club, Killarney." },
      { property: "og:title", content: "News — Muckross Rowing Club" },
      { property: "og:description", content: "Race results, club announcements and stories from Muckross RC." },
    ],
  }),
  component: NewsPage,
});

type NewsPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_name: string | null;
  published_at: string;
};

const ROWING_IRELAND_EVENTS_URL = "https://www.rowingireland.ie/regatta-hors/events/";

const fixtures = [
  { date: new Date(2026, 4, 9),  endDate: new Date(2026, 4, 9),  dateLabel: "Sat 9 May 2026",  name: "Lough Rinn Regatta",        location: "Lough Rinn",                tag: "Regatta" },
  { date: new Date(2026, 4, 16), endDate: new Date(2026, 4, 16), dateLabel: "Sat 16 May 2026", name: "Lee Regatta",                location: "Marina, Cork",              tag: "Regatta" },
  { date: new Date(2026, 4, 23), endDate: new Date(2026, 4, 23), dateLabel: "Sat 23 May 2026", name: "Castleconnell Sprint Regatta", location: "Castleconnell, Limerick", tag: "Regatta" },
  { date: new Date(2026, 4, 23), endDate: new Date(2026, 4, 23), dateLabel: "Sat 23 May 2026", name: "Dublin Metropolitan Regatta", location: "Blessington Lake",         tag: "Regatta" },
  { date: new Date(2026, 5, 6),  endDate: new Date(2026, 5, 6),  dateLabel: "Sat 6 Jun 2026",  name: "Munster Branch Regatta",     location: "NRC, Farran Wood, Cork",    tag: "Regatta" },
  { date: new Date(2026, 5, 14), endDate: new Date(2026, 5, 14), dateLabel: "Sun 14 Jun 2026", name: "Fermoy Sprint Regatta",      location: "Fermoy",                    tag: "Regatta" },
  { date: new Date(2026, 5, 20), endDate: new Date(2026, 5, 21), dateLabel: "20–21 Jun 2026",  name: "Cork Regatta",               location: "NRC, Farran Wood, Cork",    tag: "Regatta" },
  { date: new Date(2026, 5, 27), endDate: new Date(2026, 5, 28), dateLabel: "27–28 Jun 2026",  name: "Rowing Ireland 1K Classic",  location: "Lough Rinn",                tag: "Regatta" },
  { date: new Date(2026, 6, 10), endDate: new Date(2026, 6, 12), dateLabel: "10–12 Jul 2026",  name: "Irish Rowing Championships", location: "NRC, Farran Wood, Cork",    tag: "Championship" },
  { date: new Date(2026, 11, 5), endDate: new Date(2026, 11, 5), dateLabel: "Sat 5 Dec 2026",  name: "Muckross Head",              location: "NRC, Farran Wood, Cork",    tag: "Head race" },
];

function NewsPage() {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    void supabase
      .from("posts")
      .select("id, slug, title, excerpt, cover_image_url, author_name, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(60)
      .then(({ data }) => {
        setPosts((data ?? []) as NewsPost[]);
        setPostsLoading(false);
      });
  }, []);

  const upcomingFixtures = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return fixtures
      .filter((f) => f.date.getTime() >= startOfToday.getTime())
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, []);
  const eventDays = useMemo(() => {
    const days: Date[] = [];
    for (const f of upcomingFixtures) {
      const d = new Date(f.date);
      const end = f.endDate ?? f.date;
      while (d.getTime() <= end.getTime()) {
        days.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
    }
    return days;
  }, [upcomingFixtures]);
  const firstFixtureMonth = upcomingFixtures[0]?.date ?? new Date();

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-gradient-navy py-12 text-primary-foreground sm:py-16">
        <img
          src={heroAsset.url}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-15"
        />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">Club News</h1>
          <p className="mt-3 text-base text-primary-foreground/85 sm:text-lg">
            Race results, announcements and stories from the club.
          </p>
          <div className="mt-5 flex justify-center">
            <WeatherWidget />
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Events</span>
              <h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">Regatta calendar</h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Highlighted days show events Muckross RC is competing at. Open the full list for
                dates, venues and details.
              </p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-5 gap-2">
                    <CalendarIcon className="h-4 w-4" /> View all events
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Upcoming events</DialogTitle>
                    <DialogDescription>
                      Where the club is racing next.
                    </DialogDescription>
                  </DialogHeader>
                  {upcomingFixtures.length === 0 ? (
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                      No upcoming events scheduled. Check back soon.
                    </p>
                  ) : (
                  <ul className="mt-4 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
                    {upcomingFixtures.map((f) => (
                      <li
                        key={f.name}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5"
                      >
                        <div
                          className="flex shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-navy px-3 py-2 text-center text-primary-foreground sm:w-32"
                        >
                          <CalendarIcon className="h-3.5 w-3.5 opacity-80" />
                          <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider">
                            {f.dateLabel}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-serif text-base font-bold sm:text-lg">
                              <a
                                href={ROWING_IRELAND_EVENTS_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-foreground hover:text-primary hover:underline"
                              >
                                {f.name} <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </h3>
                            <span className="rounded-full border border-border/60 bg-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {f.tag}
                            </span>
                          </div>
                          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" /> {f.location}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  )}
                  <div className="mt-4 text-center">
                    <a
                      href={ROWING_IRELAND_EVENTS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      Full Rowing Ireland event calendar <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mx-auto w-fit rounded-2xl border border-border/60 bg-card p-2 shadow-soft [--cell-size:1.5rem]">
              <Calendar
                mode="single"
                weekStartsOn={1}
                defaultMonth={firstFixtureMonth}
                modifiers={{ event: eventDays }}
                modifiersClassNames={{
                  event: "bg-gradient-navy text-primary-foreground rounded-md font-bold cursor-pointer",
                }}
                className="pointer-events-auto"
                onDayClick={(day) => {
                  const isEvent = eventDays.some(
                    (d) => d.toDateString() === day.toDateString(),
                  );
                  if (isEvent) setOpen(true);
                }}
              />
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gradient-navy" /> Muckross RC competing — click a highlighted day for details
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {postsLoading ? (
            <p className="text-center text-sm text-muted-foreground">Loading posts…</p>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No news posts yet. Check back soon — or follow the club on social media for live updates.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to="/news/$slug"
                  params={{ slug: post.slug }}
                  preload="intent"
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant"
                >
                  {post.cover_image_url ? (
                    <div className="aspect-[16/10] w-full overflow-hidden bg-muted">
                      <img
                        src={post.cover_image_url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {new Date(post.published_at).toLocaleDateString("en-IE", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                      {post.author_name && <span>· {post.author_name}</span>}
                    </div>
                    <h2 className="mt-3 font-serif text-xl font-bold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">{post.excerpt}</p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary">
                      Read more →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}