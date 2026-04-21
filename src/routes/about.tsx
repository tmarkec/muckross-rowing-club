import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Anchor, Trophy, Globe2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import boathouse from "@/assets/boathouse.jpg";
import community from "@/assets/club-community.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Muckross Rowing Club, Killarney" },
      { name: "description", content: "Over 150 years of rowing heritage on the Lakes of Killarney — from the Killarney Six to the Olympic Games. Discover the story of Muckross Rowing Club." },
      { property: "og:title", content: "About Muckross Rowing Club" },
      { property: "og:description", content: "150 years of heritage, from the Elizabeth Rose to the Olympic Games." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-gradient-navy py-20 text-primary-foreground sm:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Our Story</span>
          <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">About the Club</h1>
          <p className="mt-5 text-lg text-primary-foreground/85">
            A community of rowers shaped by the lakes, mountains and traditions of Killarney.
          </p>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl shadow-elegant">
              <img src={boathouse} alt="Wooden boathouse on the shore of Lough Leane" width={1600} height={1024} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">Our home on Lough Leane</h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                Muckross Rowing Club is based in Killarney, Co. Kerry, on the shores of
                Lough Leane — the largest of Killarney's three lakes. Surrounded by
                ancient oak woodland and the MacGillycuddy's Reeks, our rowing waters are
                among the most scenic in Europe.
              </p>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Generations of rowers have trained here, and the club has long been a part
                of life in Killarney. Our distinctive yellow kit is well-known on the
                national regatta circuit.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">What we stand for</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { title: "Community", body: "A welcoming environment where rowers of every background and ability train, race and socialise together." },
              { title: "Tradition", body: "Honouring the heritage of Irish rowing and our place within the Killarney sporting community." },
              { title: "Excellence", body: "Supporting our crews to compete with pride at regattas across Ireland and beyond." },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl border border-border/60 bg-card p-8 shadow-soft">
                <h3 className="font-serif text-xl font-semibold text-foreground">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">A club for every rower</h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                From juniors taking their first strokes to masters rowers chasing personal
                bests, Muckross has a place for you. Coaching, kit and a friendly crew —
                all here, on the water.
              </p>
              <Link to="/join" className="mt-8 inline-flex items-center gap-2 rounded-md bg-gradient-yellow px-6 py-3 text-sm font-semibold text-primary shadow-yellow transition-transform hover:scale-105">
                Become a member <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="order-1 overflow-hidden rounded-2xl shadow-elegant lg:order-2">
              <img src={community} alt="Muckross rowing members on the dock" width={1600} height={1024} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}