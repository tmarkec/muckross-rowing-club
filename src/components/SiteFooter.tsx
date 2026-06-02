import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin } from "lucide-react";
import logo from "@/assets/muckross-logo.png";
import { CLUB_EMAIL, NAV_ITEMS, SOCIAL } from "@/lib/site";
import { FooterLottoCountdown } from "./FooterLottoCountdown";

/**
 * Site-wide footer: brand blurb, primary nav mirror, members links,
 * contact details and social icons. Driven by shared constants in
 * `src/lib/site.ts` so navigation stays in sync with the header.
 */
export function SiteFooter() {
  return (
    <footer className="relative bg-gradient-navy text-primary-foreground">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-yellow opacity-70" />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Muckross Rowing Club crest"
                className="h-12 w-auto"
              />
              <div>
                <div className="font-serif text-lg font-bold">Muckross RC</div>
                <div className="text-[10px] uppercase tracking-[0.15em] text-primary-foreground/70">
                  Killarney · Co. Kerry
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/75">
              Rowing on the historic lakes of Killarney, beneath the MacGillycuddy's Reeks.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:contents">
          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-secondary">
              Explore
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-primary-foreground/80 transition-colors hover:text-secondary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <FooterLottoCountdown />
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-secondary">
              Get in touch
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span>Muckross Rd, Muckross<br />Killarney, Co. Kerry, Ireland</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-secondary" />
                <a href={`mailto:${CLUB_EMAIL}`} className="transition-colors hover:text-secondary">
                  {CLUB_EMAIL}
                </a>
              </li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a href={SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="rounded-full bg-primary-foreground/10 p-2 transition-colors hover:bg-secondary hover:text-primary">
                <Facebook className="h-4 w-4" />
              </a>
              <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full bg-primary-foreground/10 p-2 transition-colors hover:bg-secondary hover:text-primary">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Muckross Rowing Club. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Rowing on the lakes of Killarney</span>
            <span aria-hidden="true">·</span>
            <Link
              to="/coaches/login"
              className="inline-flex items-center gap-1 rounded-full border border-secondary/60 bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-secondary transition-colors hover:bg-secondary hover:text-primary"
            >
              Coaches login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}