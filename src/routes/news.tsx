import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, MapPin, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/news")({
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

const posts = [
  {
    date: "Coming soon",
    category: "Announcement",
    title: "Welcome to the new Muckross Rowing Club website",
    excerpt: "We're rolling out a refreshed home for the club online — with news, regatta updates and a future members' area for coaches and athletes.",
  },
  {
    date: "Season",
    category: "Racing",
    title: "Looking ahead to the regatta season",
    excerpt: "Crews are training hard ahead of the upcoming season, with regattas across Ireland on the calendar including the famous Killarney Regatta.",
  },
  {
    date: "Year-round",
    category: "Membership",
    title: "New rowers always welcome",
    excerpt: "Whether you've never picked up an oar or you're returning after a break, the club has a place for you. Get in touch to find out more.",
  },
];

const fixtures = [
  {
    date: new Date(2026, 6, 11),
    dateLabel: "Sat 11 Jul 2026",
    name: "Killarney Regatta",
    location: "Lough Leane, Killarney",
    tag: "Home regatta",
    highlight: true,
  },
  {
    date: new Date(2026, 6, 17),
    dateLabel: "17–19 Jul 2026",
    name: "Irish Rowing Championships",
    location: "NRC, Farran Wood, Cork",
    tag: "Championship",
  },
  {
    date: new Date(2026, 7, 22),
    dateLabel: "Sat 22 Aug 2026",
    name: "Castleconnell Regatta",
    location: "River Shannon, Limerick",
    tag: "Away",
  },
  {
    date: new Date(2026, 9, 1),
    dateLabel: "Oct 2026 · TBC",
    name: "Head of the River",
    location: "Venue to be confirmed",
    tag: "Head race",
  },
];

function NewsPage() {
  const [open, setOpen] = useState(false);
  const homeDays = useMemo(() => fixtures.filter((f) => f.highlight).map((f) => f.date), []);
  const awayDays = useMemo(() => fixtures.filter((f) => !f.highlight).map((f) => f.date), []);
  const firstFixtureMonth = fixtures[0]?.date ?? new Date();

  return (
    <SiteLayout>
      <section className="bg-gradient-navy py-20 text-primary-foreground sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Updates</span>
          <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">Club News</h1>
          <p className="mt-5 text-lg text-primary-foreground/85">
            Race results, announcements and stories from the club.
          </p>
        </div>
      </section>

      <section className="bg-muted/40 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
              <Calendar
                mode="single"
                defaultMonth={firstFixtureMonth}
                modifiers={{ home: homeDays, away: awayDays }}
                modifiersClassNames={{
                  home: "bg-gradient-navy text-primary-foreground rounded-md font-bold",
                  away: "bg-secondary text-secondary-foreground rounded-md font-bold",
                }}
                className="pointer-events-auto"
              />
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-gradient-navy" /> Home regatta
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-secondary" /> Away
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Fixtures</span>
              <h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">Race calendar</h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Marked days show where Muckross is racing. Open the full fixtures list for dates,
                venues and entry details.
              </p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-5 gap-2">
                    <CalendarIcon className="h-4 w-4" /> View all fixtures
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-2xl">Upcoming regattas</DialogTitle>
                    <DialogDescription>
                      Where the club is racing next. Past events drop off automatically.
                    </DialogDescription>
                  </DialogHeader>
                  <ul className="mt-4 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
                    {fixtures.map((f) => (
                      <li
                        key={f.name}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5"
                      >
                        <div
                          className={`flex shrink-0 flex-col items-center justify-center rounded-lg px-3 py-2 text-center sm:w-32 ${
                            f.highlight
                              ? "bg-gradient-navy text-primary-foreground"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          <CalendarIcon className="h-3.5 w-3.5 opacity-80" />
                          <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider">
                            {f.dateLabel}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-serif text-base font-bold text-foreground sm:text-lg">{f.name}</h3>
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
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.title}
                className="group rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant sm:p-8"
              >
                <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-semibold text-secondary-foreground">
                    {post.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5" /> {post.date}
                  </span>
                </div>
                <h2 className="mt-4 font-serif text-2xl font-bold text-foreground transition-colors group-hover:text-primary sm:text-3xl">
                  {post.title}
                </h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{post.excerpt}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              More news coming soon. Follow the club on social media for live updates from regattas.
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}