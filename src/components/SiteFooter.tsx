import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin } from "lucide-react";
import logo from "@/assets/muckross-logo.png";

const CLUBFORCE_URL = "https://clubs.clubforce.com/clubs/rowing-muckross-rowing-club-kerry/";

export function SiteFooter() {
  return (
    <footer className="bg-gradient-navy text-primary-foreground">
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
                  Killarney · Est. heritage
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/75">
              Rowing on the historic waters of Lough Leane, beneath the MacGillycuddy's Reeks.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-secondary">
              Explore
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/" className="text-primary-foreground/80 transition-colors hover:text-secondary">Home</Link></li>
              <li><Link to="/about" className="text-primary-foreground/80 transition-colors hover:text-secondary">About</Link></li>
              <li><Link to="/news" className="text-primary-foreground/80 transition-colors hover:text-secondary">News</Link></li>
              <li><Link to="/join" className="text-primary-foreground/80 transition-colors hover:text-secondary">Join Us</Link></li>
              <li><Link to="/support" className="text-primary-foreground/80 transition-colors hover:text-secondary">Support the Club</Link></li>
              <li><Link to="/contact" className="text-primary-foreground/80 transition-colors hover:text-secondary">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-secondary">
              Members
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href={CLUBFORCE_URL} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 transition-colors hover:text-secondary">
                  ClubForce
                </a>
              </li>
              <li>
                <a href={CLUBFORCE_URL} target="_blank" rel="noopener noreferrer" className="text-primary-foreground/80 transition-colors hover:text-secondary">
                  Muckross Lotto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-secondary">
              Get in touch
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span>Lough Leane, Killarney<br />Co. Kerry, Ireland</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-secondary" />
                <a href="mailto:info@muckrossrowingclub.ie" className="transition-colors hover:text-secondary">
                  info@muckrossrowingclub.ie
                </a>
              </li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a href="#" aria-label="Facebook" className="rounded-full bg-primary-foreground/10 p-2 transition-colors hover:bg-secondary hover:text-primary">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="rounded-full bg-primary-foreground/10 p-2 transition-colors hover:bg-secondary hover:text-primary">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Muckross Rowing Club. All rights reserved.</p>
          <p>Lough Leane · Killarney · Co. Kerry</p>
        </div>
      </div>
    </footer>
  );
}