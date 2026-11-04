import { useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISS_KEY = "mrc-heritage-banner-dismissed";

/**
 * Slim announcement banner shown above the site navigation on every page.
 * Navy background, white text, yellow Donate link. Visitors can dismiss it
 * and the choice is remembered in localStorage. Scrolls away with the page.
 */
export function AnnouncementBanner() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") setVisible(false);
    } catch {
      // Storage unavailable (private mode): just keep showing the banner.
    }
  }, []);

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
    <div role="region" aria-label="Club announcement" className="bg-primary text-primary-foreground">
      <div className="relative mx-auto flex max-w-7xl items-center justify-center px-10 py-2 sm:px-12 sm:py-2.5">
        <p className="text-center text-xs font-medium leading-snug sm:text-sm">
          Honour Our Heritage. Keep Muckross Moving!{" "}
          <a
            href="https://gofund.me/eacdeb930"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap font-semibold text-secondary underline-offset-2 hover:underline"
          >
            Donate &rarr;
          </a>
        </p>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={dismiss}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-primary-foreground/70 transition-colors hover:text-primary-foreground sm:right-3"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
