import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

const CLUBFORCE_URL = "https://clubs.clubforce.com/clubs/rowing-muckross-rowing-club-kerry/";

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
      <section className="bg-gradient-navy py-20 text-primary-foreground sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Membership</span>
          <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">Join Muckross</h1>
          <p className="mt-5 text-lg text-primary-foreground/85">
            New rowers welcome from age 11 right through to masters. Dare to try a sport like
            no other — find your crew, your fitness and your community on Lough Leane.
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

          <div className="mt-16 overflow-hidden rounded-2xl bg-gradient-yellow p-10 text-center shadow-yellow sm:p-14">
            <h2 className="font-serif text-3xl font-bold text-primary sm:text-4xl">
              Membership & payments via ClubForce
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-primary/80">
              Sign up, renew your annual membership or pay-per-event for one-off
              sessions and trial rows — all handled in one place on ClubForce.
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