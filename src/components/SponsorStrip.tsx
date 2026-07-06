import { Link } from "@tanstack/react-router";
import { OarDivider } from "./OarDivider";

/**
 * Current club sponsors. `url` is optional — when present the card
 * renders as an external link to the sponsor's website.
 */
const sponsors: { name: string; url?: string }[] = [
  { name: "Cahernane House Hotel", url: "https://www.cahernane.com/" },
  { name: "Muckross Park Hotel", url: "https://www.muckrosspark.com/" },
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

        <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap items-stretch justify-center gap-3">
          {sponsors.map((s) => {
            const cardClass =
              "group inline-flex items-center rounded-full border border-border/70 bg-background py-2.5 px-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-secondary hover:shadow-yellow";
            return (
              <li key={s.name}>
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass}
                  >
                    <span className="font-serif text-sm font-bold leading-tight text-primary sm:text-base">
                      {s.name}
                    </span>
                  </a>
                ) : (
                  <div className={cardClass}>
                    <span className="font-serif text-sm font-bold leading-tight text-primary sm:text-base">
                      {s.name}
                    </span>
                  </div>
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