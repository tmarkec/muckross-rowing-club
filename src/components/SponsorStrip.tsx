import { Link } from "@tanstack/react-router";
import { OarDivider } from "./OarDivider";

/**
 * Current club sponsors. `url` is optional — when present the card
 * renders as an external link to the sponsor's website.
 */
const sponsors: { name: string; tag: string; url?: string }[] = [
  { name: "Cahernane House Hotel", tag: "Hospitality" },
  {
    name: "Muckross Park Hotel",
    tag: "Hospitality",
    url: "https://www.muckrosspark.com/",
  },
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

        <ul className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
          {sponsors.map((s) => {
            const cardClass =
              "group flex aspect-[5/3] flex-col items-center justify-center rounded-xl border border-border/70 bg-background px-3 py-4 text-center shadow-soft transition-all hover:-translate-y-0.5 hover:border-secondary hover:shadow-yellow";
            const inner = (
              <>
                <span className="font-serif text-sm font-bold leading-tight text-primary sm:text-base">
                  {s.name}
                </span>
                <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.tag}
                </span>
              </>
            );
            return (
              <li key={s.name}>
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className={cardClass}>{inner}</div>
                )}
              </li>
            );
          })}
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