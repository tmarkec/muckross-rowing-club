import { useEffect, useState } from "react";
import { Ticket } from "lucide-react";
import { CLUBFORCE_URL } from "@/lib/site";

/**
 * Compact countdown to the next Saturday 20:00 Europe/Dublin lotto draw,
 * rendered inside the site footer with a CTA to the ClubForce lotto page.
 */
function getNextDraw(now: Date): Date {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Dublin",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value);
  const y = get("year"), m = get("month"), d = get("day");
  const hh = get("hour"), mm = get("minute"), ss = get("second");
  const dublinDate = new Date(Date.UTC(y, m - 1, d));
  const dow = dublinDate.getUTCDay();
  let daysUntilSat = (6 - dow + 7) % 7;
  if (daysUntilSat === 0 && (hh > 20 || (hh === 20 && (mm > 0 || ss > 0)))) {
    daysUntilSat = 7;
  }
  const target = new Date(Date.UTC(y, m - 1, d + daysUntilSat, 20, 0, 0));
  const tzOffsetMinutes = getDublinOffsetMinutes(target);
  return new Date(target.getTime() - tzOffsetMinutes * 60_000);
}

function getDublinOffsetMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Dublin",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find(p => p.type === t)?.value);
  const asUTC = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return (asUTC - date.getTime()) / 60_000;
}

export function FooterLottoCountdown() {
  const [mounted, setMounted] = useState(false);
  const [r, setR] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const now = new Date();
      let diff = Math.max(0, getNextDraw(now).getTime() - now.getTime());
      const d = Math.floor(diff / 86_400_000); diff -= d * 86_400_000;
      const h = Math.floor(diff / 3_600_000); diff -= h * 3_600_000;
      const m = Math.floor(diff / 60_000); diff -= m * 60_000;
      const s = Math.floor(diff / 1000);
      setR({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const cells = [
    { label: "D", value: r.d },
    { label: "H", value: r.h },
    { label: "M", value: r.m },
    { label: "S", value: r.s },
  ];

  return (
    <div>
      <h4 className="font-serif text-sm font-semibold uppercase tracking-wider text-secondary">
        Muckross Lotto
      </h4>
      <p className="mt-4 text-xs text-primary-foreground/70">
        Next draw — Saturday 20:00
      </p>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {cells.map((c) => (
          <div
            key={c.label}
            className="rounded-md bg-primary-foreground/10 px-1.5 py-2 text-center"
          >
            <div className="font-mono text-base font-bold tabular-nums text-secondary">
              {mounted ? String(c.value).padStart(2, "0") : "--"}
            </div>
            <div className="text-[9px] font-semibold uppercase tracking-wider text-primary-foreground/60">
              {c.label}
            </div>
          </div>
        ))}
      </div>
      <a
        href={CLUBFORCE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-yellow px-4 py-2 text-xs font-semibold text-primary shadow-yellow transition-transform hover:scale-105"
      >
        <Ticket className="h-3.5 w-3.5" />
        Play the Lotto
      </a>
    </div>
  );
}