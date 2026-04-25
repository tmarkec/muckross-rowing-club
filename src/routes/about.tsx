import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Anchor, Trophy, Globe2, FileText, Download } from "lucide-react";
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
          <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">150 Years on the Lakes of Killarney</h1>
          <p className="mt-5 text-lg text-primary-foreground/85">
            From the Killarney Six to the Olympic Games — the heritage and ambition of Muckross Rowing Club.
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
                Widely considered the oldest rowing club in Killarney, Muckross has been
                the heartbeat of the Muckross community for over 150 years — deeply
                intertwined with the families who lived and worked on the Muckross Estate.
                Our distinctive yellow kit is known across the national regatta circuit.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-20 text-primary-foreground sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Heritage</span>
            <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">A century and a half of rowing</h2>
            <p className="mt-4 text-primary-foreground/80">
              Few clubs in the world can trace a story like ours. Here are the moments that shaped Muckross.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                year: "Mid-1800s",
                title: "Foundations",
                body: "Muckross is founded as Killarney's oldest rowing club, synonymous with the Traditional Killarney Six — a unique fixed-seat racing style on the Lakes of Killarney.",
              },
              {
                year: "1924",
                title: "The Elizabeth Rose",
                body: "The club launches its most iconic boat, named after the daughter of the Vincent family of Muckross House. She celebrated her centenary in 2024 and remains the oldest traditional racing boat still in active use on the lakes.",
              },
              {
                year: "1993",
                title: "Bourn Vincent victory",
                body: "A legendary win at the Killarney Regatta ends a 20-year wait for the Senior Men's Bourn Vincent Trophy and sparks decades of dominance in traditional racing.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-primary-foreground/15 bg-primary-foreground/5 p-7">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">{item.year}</span>
                <h3 className="mt-2 font-serif text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-primary-foreground/80">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">1990s — Present</span>
              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">From Lough Leane to the world stage</h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                In the 1990s Muckross expanded beyond traditional lake rowing into
                Olympic-style sliding-seat rowing, opening the door to national and
                international competition. Our athletes have since worn the Green Jersey
                of Ireland at every level of the sport.
              </p>
              <ul className="mt-6 space-y-4">
                <li className="flex gap-4">
                  <Trophy className="mt-0.5 h-5 w-5 flex-none text-secondary" />
                  <div>
                    <p className="font-semibold text-foreground">Olympic Games</p>
                    <p className="text-sm text-muted-foreground">Multiple club Olympians at Athens 2004 and Beijing 2008.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Globe2 className="mt-0.5 h-5 w-5 flex-none text-secondary" />
                  <div>
                    <p className="font-semibold text-foreground">World Championships</p>
                    <p className="text-sm text-muted-foreground">World Championship Gold and multiple podium finishes for Muckross athletes.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Anchor className="mt-0.5 h-5 w-5 flex-none text-secondary" />
                  <div>
                    <p className="font-semibold text-foreground">Coupe de la Jeunesse & Home Internationals</p>
                    <p className="text-sm text-muted-foreground">A staple of the Irish junior and senior teams, with regular medals at Europe's leading junior regatta.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="overflow-hidden rounded-2xl shadow-elegant">
              <img src={community} alt="Muckross rowing crew on the dock" width={1600} height={1024} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">A club of two traditions</h2>
            <p className="mt-4 text-muted-foreground">
              On any evening at the Old Boathouse on Lough Leane, you might see a
              wood-built Killarney Six training alongside a carbon-fibre Olympic scull —
              past and future, side by side.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { title: "Heritage", body: "Honouring the Killarney Six and the world's oldest traditional regatta — a 150-year-old spirit carried by every new generation." },
              { title: "Community", body: "A welcoming home for rowers of every background and ability, rooted in the families and traditions of the Muckross Estate." },
              { title: "Excellence", body: "From the Bourn Vincent Trophy to the Olympic Games — supporting our crews to compete with pride at the highest level." },
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

      {/* Club documents & policies */}
      <section id="documents" className="bg-muted/40 py-20 scroll-mt-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-elegant">
              <FileText className="h-6 w-6 text-secondary" />
            </div>
            <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/70">
              Governance
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              Club documents & policies
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              Muckross Rowing Club is committed to providing a safe, welcoming and well-governed
              environment for all members. Our key policy documents are available to download below.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {[
              { title: "Code of Behaviour", body: "Standards of conduct expected of members, coaches and supporters." },
              { title: "Child Safeguarding Statement", body: "How we protect and support our junior rowers." },
              { title: "Anti-Bullying Policy", body: "Our commitment to a respectful, inclusive club." },
              { title: "Health & Safety Policy", body: "On-water and boathouse safety procedures." },
              { title: "Club Constitution", body: "The governing rules of Muckross Rowing Club." },
              { title: "Complaints & Disciplinary Procedure", body: "How concerns are raised and addressed fairly." },
            ].map((doc) => (
              <li key={doc.title}>
                <a
                  href="#"
                  className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-secondary hover:shadow-elegant"
                >
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gradient-yellow shadow-yellow">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-base font-semibold text-foreground">{doc.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{doc.body}</p>
                    <span className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      PDF · Coming soon
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            For any questions on club governance or to request a document,{" "}
            <Link to="/contact" className="font-semibold text-primary underline-offset-4 hover:underline">
              get in touch
            </Link>.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}