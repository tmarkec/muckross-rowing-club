import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "mrc-heritage-banner-dismissed";

/**
 * Slim announcement banner shown above the site navigation on every page.
 * It alternates every two seconds between the club's navy look (white text,
 * yellow Donate link) and the club's yellow look (navy text, navy Donate
 * link), with a short colour fade. Visitors can dismiss it and the choice is
 * remembered in localStorage. Scrolls away with the page.
 */
export function AnnouncementBanner() {
  const [visible, setVisible] = useState(true);
  const [yellow, setYellow] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") setVisible(false);
    } catch {
      // Storage unavailable (private mode): just keep showing the banner.
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = window.setInterval(() => setYellow((v) => !v), 1000);
    return () => window.clearInterval(id);
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Ignore: banner will simply reappear on the next visit.
    }
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Club announcement"
      className={`transition-[background-color,color] duration-[2400ms] ease-in-out ${
        yellow ? "bg-secondary text-primary" : "bg-primary text-primary-foreground"
      }`}
    >
      <div className="relative mx-auto flex max-w-7xl items-center justify-center px-10 py-2 sm:px-12 sm:py-2.5">
        <p className="text-center text-xs font-medium leading-snug sm:text-sm">
          Honour Our Heritage. Keep Muckross Moving!{" "}
          <a
            href="https://gofund.me/eacdeb930"
            target="_blank"
            rel="noopener noreferrer"
            className={`whitespace-nowrap font-bold underline-offset-2 transition-colors duration-[2400ms] ease-in-out hover:underline ${
              yellow ? "text-primary" : "text-secondary"
            }`}
          >
            Donate &rarr;
          </a>
        </p>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={dismiss}
          className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 transition-colors duration-[2400ms] ease-in-out sm:right-3 ${
            yellow
              ? "text-primary/60 hover:text-primary"
              : "text-primary-foreground/70 hover:text-primary-foreground"
          }`}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
