import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Sun, Sparkles, Users } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { CLUBFORCE_URL } from "@/lib/site";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join Muckross Rowing Club — Membership" },
      { name: "description", content: "Become a member of Muckross Rowing Club. Junior, senior, masters and recreational rowing on Lough Leane, Killarney." },
      { property: "og:title", content: "Join Muckross Rowing Club" },
      { property: "og:description", content: "Membership info and how to join Muckross Rowing Club in Killarney." },
    ],
  }),
  component: JoinPage,
});

const tiers = [
  {
    name: "Junior",
    body: "For young rowers aged 11+ learning the sport. Coached sessions, club kit and a pathway into competitive crews.",
    bullets: ["Ages 11+", "Water & gym sessions", "Qualified coaches"],
  },
  {
    name: "Senior",
    body: "For competitive rowers training year-round and racing for the club at regattas across Ireland.",
    bullets: ["Year-round training", "Regatta racing", "Boat & equipment access"],
  },
  {
    name: "Recreational & Masters",
    body: "Row for fitness, fun and friendship. A flexible option for those returning to the sport or rowing for enjoyment.",
    bullets: ["Flexible training", "All abilities welcome", "Social events"],
  },
];

function JoinPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-navy py-12 text-primary-foreground sm:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">Join Muckross</h1>
          <p className="mt-3 text-base text-primary-foreground/85 sm:text-lg">
            New rowers welcome from age 11 right through to masters. Dare to try a sport
            like no other, find your crew, your fitness and your community on Lough Leane.
          </p>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {tiers.map((t) => (
              <div key={t.name} className="flex flex-col rounded-2xl border border-border/60 bg-card p-8 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
                <h3 className="font-serif text-2xl font-bold text-foreground">{t.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                <ul className="mt-6 space-y-2.5">
                  {t.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Adults & Parents rowing */}
          <div id="adults-parents" className="mt-20 scroll-mt-24 grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-elegant">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/70">For grown-ups</span>
              <h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Adults & Parents rowing
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                You don't have to be a junior to take up rowing. We run dedicated sessions
                for adults and parents of junior rowers — a relaxed way to learn the sport
                alongside your kids, get out on Lough Leane and meet other club families.
              </p>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {[
                  "No experience needed",
                  "Coached intro sessions",
                  "Train alongside your junior",
                  "Beginner-friendly boats",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" /> {b}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                search={{ subject: "Adults & Parents rowing" }}
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get in touch <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Summer & Easter camps */}
          <div id="camps" className="mt-16 scroll-mt-24 rounded-2xl border border-border/60 bg-card p-8 shadow-soft sm:p-12">
            <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-start">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-yellow shadow-yellow">
                <Sun className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/70">New members</span>
                <h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                  Easter & Summer camps
                </h2>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Our Easter and Summer camps are the best way to try rowing for the first
                  time and join the rowing club. Run at Muckross, they're open to new
                  members and a friendly first step into the club.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    { title: "Easter Camp", body: "A short intro over the Easter break, perfect for getting a taste of rowing before the season ends." },
                    { title: "Summer Camp", body: "Longer weeks across the summer, building water skills and crew rowing. We welcome new members to join us for the remainder of the season and become part of the club." },
                  ].map((c) => (
                    <div key={c.title} className="rounded-xl border border-border/60 bg-background p-5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-secondary" />
                        <h3 className="font-serif text-lg font-semibold text-foreground">{c.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-sm text-muted-foreground">
                  Camp dates will be announced in the news section of this site, as well
                  as on our Facebook and Instagram.
                </p>
                <Link
                  to="/contact"
                  search={{ subject: "Easter / Summer Camp" }}
                  className="mt-5 inline-flex items-center gap-2 rounded-md bg-gradient-yellow px-5 py-2.5 text-sm font-semibold text-primary shadow-yellow transition-transform hover:scale-105"
                >
                  Register interest <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 overflow-hidden rounded-2xl bg-gradient-yellow p-10 text-center shadow-yellow sm:p-14">
            <h2 className="font-serif text-3xl font-bold text-primary sm:text-4xl">
              Membership & payments via ClubForce
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-primary/80">
              Sign up or renew your annual membership in one place on ClubForce.
              For anything else, get in touch.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={CLUBFORCE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
              >
                Open ClubForce <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                to="/contact"
                search={{ subject: "Join Us" }}
                className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-background/60 px-6 py-3 text-sm font-semibold text-primary backdrop-blur-sm transition-colors hover:bg-background"
              >
                Contact the club
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}