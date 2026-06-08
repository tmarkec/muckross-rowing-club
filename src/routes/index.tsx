import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, Heart, Users, Waves, Trophy } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { CLUBFORCE_URL, SITE_URL, SOCIAL } from "@/lib/site";
import heroLakeAsset from "@/assets/hero-lake.asset.json";
import rowingActionAsset from "@/assets/rowing-action.asset.json";
import communityAsset from "@/assets/club-community.asset.json";
import boathouseAsset from "@/assets/boathouse.asset.json";
import sunsetEightsAsset from "@/assets/sunset-eights.asset.json";
import juniorsBoatAsset from "@/assets/juniors-boat.asset.json";
import juniorSquadAsset from "@/assets/junior-squad.asset.json";
import oldBoathouseAsset from "@/assets/old-boathouse.asset.json";
// Hero uses the "pulling together" sunset eight — wider composition reads
// better on desktop than the tighter rowing-action crop.
const heroImage = sunsetEightsAsset.url;
const pullingTogether = communityAsset.url;
const boathouse = oldBoathouseAsset.url;
void juniorSquadAsset;
const community = juniorsBoatAsset.url;
// kept for backwards compatibility in JSON-LD references below
void heroLakeAsset;
void rowingActionAsset;
void boathouseAsset;

/** Structured data for the homepage — describes the club to search engines. */
const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsClub",
  name: "Muckross Rowing Club",
  alternateName: ["Muckross RC", "Muckross Rowing"],
  sport: "Rowing",
  url: SITE_URL,
  logo: `${SITE_URL}/muckross-logo.png`,
  image: `${SITE_URL}/hero-lake.jpg`,
  description:
    "Muckross Rowing Club — rowing on the historic lakes of Killarney, Co. Kerry. Welcoming members of all ages and abilities.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Muckross Rd, Muckross",
    addressLocality: "Killarney",
    addressRegion: "Co. Kerry",
    postalCode: "V93",
    addressCountry: "IE",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 52.02188586501607,
    longitude: -9.508196213456204,
  },
  areaServed: "Killarney, Co. Kerry, Ireland",
  sameAs: [SOCIAL.facebook, SOCIAL.instagram],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Muckross Rowing Club | Killarney, Co. Kerry — Rowing on the Lakes of Killarney" },
      { name: "description", content: "Muckross Rowing Club — a welcoming rowing club on the historic lakes of Killarney, Co. Kerry. Junior, senior, masters & learn-to-row programmes for all ages and abilities." },
      { name: "keywords", content: "Muckross Rowing Club, Muckross RC, rowing Killarney, Killarney rowing club, Lough Leane rowing, rowing Kerry, learn to row Killarney" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "theme-color", content: "#0a2540" },
      { property: "og:title", content: "Muckross Rowing Club — Killarney, Co. Kerry" },
      { property: "og:description", content: "Rowing on the historic lakes of Killarney, beneath the MacGillycuddy's Reeks." },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}/hero-lake.jpg` },
      { property: "og:locale", content: "en_IE" },
      { name: "twitter:image", content: `${SITE_URL}/hero-lake.jpg` },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(homeJsonLd),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative h-[88vh] min-h-[560px] w-full overflow-hidden">
        <img
          src={heroImage}
          alt="Rowing eight gliding across Lough Leane at sunrise with the MacGillycuddy's Reeks in the background"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-4 pb-16 pt-20 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full border border-secondary/40 bg-primary/30 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-secondary backdrop-blur-sm">
              Killarney · Co. Kerry
            </span>
            <h1 className="mt-6 font-serif text-4xl font-bold leading-[1.05] text-primary-foreground sm:text-5xl lg:text-6xl">
              Rowing on the <span className="text-secondary">historic lakes</span> of Killarney
            </h1>
          </div>
          <div className="max-w-2xl mt-auto">
            <div className="flex flex-wrap gap-3">
              <Link
                to="/join"
                className="inline-flex items-center gap-2 rounded-md bg-gradient-yellow px-6 py-3 text-sm font-semibold text-primary shadow-yellow transition-transform hover:scale-105"
              >
                Join the Club <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 bg-primary-foreground/5 px-6 py-3 text-sm font-semibold text-primary-foreground backdrop-blur-sm transition-colors hover:bg-primary-foreground/15"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/70">A club for everyone</span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              More than a sport, a community
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              From learn-to-row beginners to seasoned competitors, Muckross brings
              together people who share a love of rowing on the lakes of Killarney.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              { icon: Waves, title: "Scenic Waters", body: "Train on Lough Leane, one of Ireland's most beautiful lakes, shaped by mountains and ancient woodland." },
              { icon: Users, title: "All Abilities", body: "Junior, senior, masters and recreational rowing. Whether you've never rowed before or have raced competitively, you're welcome." },
              { icon: Award, title: "Proud Heritage", body: "A long-standing fixture of Irish rowing, with a presence at regattas across the country including the famous Killarney Regatta." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="group rounded-2xl border border-border/60 bg-card p-8 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-yellow shadow-yellow">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-5 font-serif text-xl font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Split image feature */}
      <section className="bg-muted/40 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl shadow-elegant">
              <img
                src={pullingTogether}
                alt="Muckross rowing crew in yellow kit pulling together on the lake"
                width={1600}
                height={900}
                loading="lazy"
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/70">Train · Race · Belong</span>
              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Pulling together, since the beginning
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                Our rowers train year-round, taking to the water at dawn and competing at
                regattas across Ireland. The yellow of Muckross is a familiar sight on the
                start line, and on the podium.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                We welcome new members every season. No experience is needed, just
                enthusiasm and a willingness to be part of a crew.
              </p>
              <Link
                to="/join"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                How to join <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About preview */}
      <section className="bg-background py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl shadow-elegant">
              <img
                src={boathouse}
                alt="Wooden boathouse on the shore of Lough Leane"
                width={1600}
                height={1024}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/70">About the club</span>
              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                150 years on the Lakes of Killarney
              </h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                Widely considered the oldest rowing club in Killarney, Muckross has been
                the heartbeat of the local community for over 150 years, from the
                Traditional Killarney Six and the iconic <em>Elizabeth Rose</em> to
                athletes who have worn the Green Jersey of Ireland at the Olympic Games.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                On any evening at Muckross you might see a wood-built Killarney six
                training alongside a carbon-fibre Olympic scull, past and future side by side.
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Trophy, label: "Olympic athletes" },
                  { icon: Award, label: "World medals" },
                  { icon: Users, label: "All ages welcome" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                    <Icon className="h-4 w-4 text-secondary" /> {label}
                  </li>
                ))}
              </ul>
              <Link
                to="/about"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Read our full story <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="relative overflow-hidden bg-gradient-navy py-20 text-primary-foreground sm:py-28">
        <img
          src={community}
          alt=""
          aria-hidden="true"
          width={1600}
          height={1024}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-15"
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-serif text-3xl font-bold sm:text-4xl">
            Become part of the Muckross story
          </h2>
          <p className="mt-4 text-base text-primary-foreground/80 sm:text-lg">
            Memberships and club fees are all handled through ClubForce.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={CLUBFORCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-yellow px-6 py-3 text-sm font-semibold text-primary shadow-yellow transition-transform hover:scale-105"
            >
              Visit ClubForce <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/support"
              className="inline-flex items-center gap-2 rounded-md border border-secondary/40 bg-secondary/10 px-6 py-3 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/20"
            >
              <Heart className="h-4 w-4" /> Support the club
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
