import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { CLUBFORCE_URL, NAV_ITEMS } from "@/lib/site";

/**
 * Sticky top navigation bar. Renders the club crest, primary nav and the
 * external ClubForce CTA. Collapses to a hamburger menu under `md`.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3" onClick={() => setOpen(false)}>
          <img
            src="/muckross-logo.png"
            alt="Muckross Rowing Club crest"
            className="h-10 w-auto sm:h-11"
          />
          <div className="leading-tight whitespace-nowrap">
            <div className="font-serif text-base font-bold text-primary sm:text-lg">Muckross</div>
            <div className="hidden text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground sm:block">
              Rowing Club
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex lg:gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium text-foreground/75 transition-colors hover:text-primary lg:px-3"
              activeProps={{ className: "text-primary font-semibold" }}
              activeOptions={{ exact: true }}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={CLUBFORCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex shrink-0 items-center justify-center rounded-md bg-gradient-yellow px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary shadow-yellow transition-transform hover:scale-105 lg:px-5"
          >
            ClubForce
          </a>
        </nav>

        <button
          aria-label="Toggle menu"
          className="inline-flex items-center justify-center rounded-md p-2 text-primary md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/40 bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
                activeProps={{ className: "text-primary font-semibold bg-muted" }}
                activeOptions={{ exact: true }}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={CLUBFORCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center rounded-md bg-gradient-yellow px-4 py-3 text-sm font-semibold text-primary shadow-yellow"
            >
              ClubForce
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}