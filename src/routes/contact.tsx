import { createFileRoute } from "@tanstack/react-router";
import { useState, type MouseEvent } from "react";
import { Mail, MapPin, Send, Navigation } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

const LAT = 52.02188586501607;
const LNG = -9.508196213456204;
const BBOX_DELTA = 0.01;
const OSM_EMBED_URL = `https://www.openstreetmap.org/export/embed.html?bbox=${LNG - BBOX_DELTA}%2C${LAT - BBOX_DELTA}%2C${LNG + BBOX_DELTA}%2C${LAT + BBOX_DELTA}&layer=mapnik&marker=${LAT}%2C${LNG}`;
const DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${LAT},${LNG}`;

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Muckross Rowing Club, Killarney" },
      { name: "description", content: "Get in touch with Muckross Rowing Club. Find us on the shores of Lough Leane in Killarney, Co. Kerry." },
      { property: "og:title", content: "Contact Muckross Rowing Club" },
      { property: "og:description", content: "Get in touch with the club in Killarney." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [directionsCopied, setDirectionsCopied] = useState(false);

  const handleDirectionsClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (window.self === window.top) {
      return;
    }

    event.preventDefault();

    try {
      await navigator.clipboard.writeText(`${LAT}, ${LNG}`);
      setDirectionsCopied(true);
      window.setTimeout(() => setDirectionsCopied(false), 2200);
    } catch {
      setDirectionsCopied(false);
    }
  };

  return (
    <SiteLayout>
      <section className="bg-gradient-navy py-20 text-primary-foreground sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Get in touch</span>
          <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">Contact the Club</h1>
          <p className="mt-5 text-lg text-primary-foreground/85">
            We'd love to hear from you — whether you're keen to row or just curious about the club.
          </p>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl font-bold text-foreground">Where to find us</h2>
              <ul className="mt-6 space-y-5 text-sm">
                <li className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-yellow shadow-yellow">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Boathouse</div>
                    <p className="mt-1 text-muted-foreground">Muckross Rd, Muckross<br />Killarney, Co. Kerry, Ireland</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-yellow shadow-yellow">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Email</div>
                    <a href="mailto:info@muckrossrowingclub.ie" className="mt-1 block text-muted-foreground transition-colors hover:text-primary">
                      info@muckrossrowingclub.ie
                    </a>
                  </div>
                </li>
              </ul>

              <div className="mt-8 rounded-2xl bg-muted/50 p-6">
                <h3 className="font-serif text-lg font-semibold text-foreground">Membership</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  All membership and pay-per-row is handled through ClubForce.
                </p>
                <a
                  href={CLUBFORCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  Open ClubForce →
                </a>
              </div>
            </div>

            <div className="lg:col-span-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="rounded-2xl border border-border/60 bg-card p-8 shadow-soft"
              >
                <h2 className="font-serif text-2xl font-bold text-foreground">Send us a message</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We'll get back to you as soon as we can.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-foreground" htmlFor="name">Name</label>
                    <input id="name" required className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring/30 transition focus:ring-2" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground" htmlFor="email">Email</label>
                    <input id="email" type="email" required className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring/30 transition focus:ring-2" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-foreground" htmlFor="subject">Subject</label>
                  <input id="subject" className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring/30 transition focus:ring-2" />
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-foreground" htmlFor="message">Message</label>
                  <textarea id="message" rows={5} required className="mt-1.5 w-full resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none ring-ring/30 transition focus:ring-2" />
                </div>

                <button
                  type="submit"
                  className="mt-6 inline-flex items-center gap-2 rounded-md bg-gradient-yellow px-6 py-3 text-sm font-semibold text-primary shadow-yellow transition-transform hover:scale-105"
                >
                  <Send className="h-4 w-4" /> Send message
                </button>

                {submitted && (
                  <p className="mt-4 rounded-md bg-secondary/40 px-4 py-3 text-sm text-foreground">
                    Thanks — your message has been recorded. (Email delivery will be wired up later via Lovable Cloud.)
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/40 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/70">
                Find the boathouse
              </span>
              <h2 className="mt-2 font-serif text-2xl font-bold text-foreground sm:text-3xl">
                On the shores of Lough Leane
              </h2>
            </div>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleDirectionsClick}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Navigation className="h-4 w-4" /> Get directions
            </a>
            {directionsCopied && (
              <p className="text-sm text-muted-foreground">
                Preview blocks map sites here, so the coordinates were copied instead.
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/60 shadow-soft">
            <iframe
              title="Muckross Rowing Club boathouse location on Lough Leane"
              src={OSM_EMBED_URL}
              loading="lazy"
              className="h-[420px] w-full border-0"
            />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}