import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/news", label: "News" },
  { to: "/join", label: "Join Us" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-yellow shadow-yellow">
            <span className="font-serif text-lg font-bold text-primary">M</span>
          </div>
          <div className="leading-tight">
            <div className="font-serif text-base font-bold text-primary sm:text-lg">Muckross</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Rowing Club
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary font-semibold" }}
              activeOptions={{ exact: true }}
            >
              {item.label}
            </Link>
          ))}
          <a
            href="https://clubs.clubforce.com/clubs/rowing-muckross-rowing-club-kerry/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center justify-center rounded-md bg-gradient-yellow px-4 py-2 text-sm font-semibold text-primary shadow-yellow transition-transform hover:scale-105"
          >
            Membership
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
            {navItems.map((item) => (
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
              href="https://clubs.clubforce.com/clubs/rowing-muckross-rowing-club-kerry/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center justify-center rounded-md bg-gradient-yellow px-4 py-3 text-sm font-semibold text-primary shadow-yellow"
            >
              Membership / Pay-Per-Row
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}