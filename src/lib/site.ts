/**
 * Site-wide constants shared across routes and components.
 * Centralising these avoids drift when an external URL or
 * contact detail changes — update once, propagate everywhere.
 */

/** Public Muckross Rowing Club site URL (used for canonical / JSON-LD). */
export const SITE_URL = "https://muckrossrowingclub.ie";

/** ClubForce membership / payments portal — opened in a new tab. */
export const CLUBFORCE_URL =
  "https://clubs.clubforce.com/clubs/rowing-muckross-rowing-club-kerry/";

/** Primary club contact email. */
export const CLUB_EMAIL = "info@muckrossrowingclub.ie";

/** Social profiles. */
export const SOCIAL = {
  facebook: "https://www.facebook.com/muckrossrc/",
  instagram: "https://www.instagram.com/muckrossrc/",
} as const;

/** Primary navigation items, shared by header and footer. */
export const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/news", label: "News" },
  { to: "/join", label: "Join Us" },
  { to: "/support", label: "Support us" },
  { to: "/contact", label: "Contact" },
] as const;