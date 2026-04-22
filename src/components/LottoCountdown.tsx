import { useEffect, useState } from "react";

// Returns the next Saturday 20:00 in Europe/Dublin time, as a UTC Date.
function getNextDraw(now: Date): Date {
  // Compute current time in Dublin
  const dublinNowStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Dublin",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => Number(dublinNowStr.find(p => p.type === t)?.value);
  const y = get("year"), m = get("month"), d = get("day");
  const hh = get("hour"), mm = get("minute"), ss = get("second");

  // Day of week for that Dublin date (use UTC to avoid local TZ)
  const dublinDate = new Date(Date.UTC(y, m - 1, d));
  const dow = dublinDate.getUTCDay(); // 0 Sun .. 6 Sat
  let daysUntilSat = (6 - dow + 7) % 7;
  // If today is Saturday but past 20:00 Dublin, go to next week
  if (daysUntilSat === 0 && (hh > 20 || (hh === 20 && (mm > 0 || ss > 0)))) {
    daysUntilSat = 7;
  }

  // Target Dublin wall-clock: that Saturday at 20:00
  const target = new Date(Date.UTC(y, m - 1, d + daysUntilSat, 20, 0, 0));
  // target currently treats 20:00 as UTC; we need 20:00 Dublin -> convert by offset diff
  // Compute Dublin offset at target by formatting target back
  const tzOffsetMinutes = getDublinOffsetMinutes(target);
  return new Date(target.getTime() - tzOffsetMinutes * 60_000);
}

function getDublinOffsetMinutes(date: Date): number {
  // Get the Dublin local time parts of `date` and compare to its UTC parts
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

export function LottoCountdown() {
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const now = new Date();
      const target = getNextDraw(now);
      let diff = Math.max(0, target.getTime() - now.getTime());
      const d = Math.floor(diff / 86_400_000); diff -= d * 86_400_000;
      const h = Math.floor(diff / 3_600_000); diff -= h * 3_600_000;
      const m = Math.floor(diff / 60_000); diff -= m * 60_000;
      const s = Math.floor(diff / 1000);
      setRemaining({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const cells = [
    { label: "Days", value: remaining.d },
    { label: "Hours", value: remaining.h },
    { label: "Minutes", value: remaining.m },
    { label: "Seconds", value: remaining.s },
  ];

  return (
    <div className="mt-6 grid grid-cols-4 gap-2 sm:gap-3">
      {cells.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-border/60 bg-background px-2 py-3 text-center shadow-soft"
        >
          <div className="font-mono text-2xl font-bold tabular-nums text-primary sm:text-3xl">
            {mounted ? String(c.value).padStart(2, "0") : "--"}
          </div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}
