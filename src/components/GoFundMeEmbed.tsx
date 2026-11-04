import { useEffect, useRef } from "react";

const EMBED_SCRIPT = "https://www.gofundme.com/static/js/embed.js";
const WIDGET_URL =
  "https://www.gofundme.com/f/honour-our-heritage-keep-muckross-moving/widget/large?attribution_id=sl%3A065cb54e-a075-4f1d-9a61-2a0dd303587b";

/**
 * GoFundMe donation widget ("large" size).
 *
 * GoFundMe's embed.js only converts .gfm-embed divs on DOMContentLoaded,
 * which has already fired by the time React mounts, so it never sees the
 * div. We build the iframe exactly as embed.js does (same URL parameters,
 * class and height) and still load embed.js so its resize message listener
 * keeps the widget height in sync. The script is added from useEffect, not
 * a JSX <script> tag, and is removed again on unmount.
 */
export function GoFundMeEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const build = () => {
      if (container.querySelector("iframe")) return;
      const url = new URL(WIDGET_URL);
      // Same parameters embed.js sets when it builds the iframe itself.
      url.searchParams.set("utm_content", window.location.hostname || "none");
      url.searchParams.set("utm_medium", "referral");
      url.searchParams.set("utm_source", "widget");
      const iframe = document.createElement("iframe");
      iframe.className = "gfm-embed-iframe";
      iframe.setAttribute("width", "100%");
      iframe.setAttribute("height", "500");
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("scrolling", "no");
      iframe.setAttribute("title", "GoFundMe donation widget");
      iframe.src = url.toString();
      container.appendChild(iframe);
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_SCRIPT}"]`);
    const created = !existing;
    const script = existing ?? document.createElement("script");
    if (created) {
      script.src = EMBED_SCRIPT;
      script.async = true;
      document.body.appendChild(script);
    }

    // If the document is still loading, embed.js handles the conversion
    // itself on DOMContentLoaded. Otherwise we build the iframe on script
    // load (or straight away if the script is already loaded).
    if (document.readyState === "loading") {
      script.addEventListener("load", () => {}, { once: true });
    } else if (created) {
      script.addEventListener("load", build, { once: true });
    } else {
      build();
    }

    return () => {
      if (created) script.remove();
      const iframe = container.querySelector("iframe");
      if (iframe) iframe.remove();
    };
  }, []);

  return <div ref={containerRef} className="gfm-embed" data-url={WIDGET_URL} />;
}
