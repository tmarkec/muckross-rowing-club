import { Link } from "@tanstack/react-router";
import { OarDivider } from "./OarDivider";

const sponsors = [
  { name: "Reeks Brewing Co.", tag: "Local Brewery" },
  { name: "Lough Leane Hotel", tag: "Hospitality" },
  { name: "Killarney Outdoors", tag: "Outdoor Gear" },
  { name: "Kerry Marine Supplies", tag: "Marine" },
  { name: "MacGillycuddy Insurance", tag: "Insurance" },
];

export function SponsorStrip() {
  return (
    <section className="border-y border-border/60 bg-muted/40 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <OarDivider className="mb-8" />
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Proudly supported by
          </span>
          <h2 className="font-serif text-lg text-foreground sm:text-xl">
            Our club sponsors
          </h2>
        </div>

        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {sponsors.map((s) => (
            <li
              key={s.name}
              className="group flex aspect-[5/3] flex-col items-center justify-center rounded-xl border border-border/70 bg-background px-3 py-4 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:border-secondary hover:shadow-yellow"
            >
              <span className="font-serif text-sm font-bold leading-tight text-primary sm:text-base">
                {s.name}
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {s.tag}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 text-center">
          <Link
            to="/support"
            className="text-xs font-semibold uppercase tracking-wider text-primary underline-offset-4 hover:text-secondary hover:underline"
          >
            Become a sponsor / Support the club →
          </Link>
        </div>
      </div>
    </section>
  );
}