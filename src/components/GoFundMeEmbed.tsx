import { useEffect } from "react";

const EMBED_SCRIPT = "https://www.gofundme.com/static/js/embed.js";
const WIDGET_URL =
  "https://www.gofundme.com/f/honour-our-heritage-keep-muckross-moving/widget/large?attribution_id=sl%3A065cb54e-a075-4f1d-9a61-2a0dd303587b";

/**
 * GoFundMe donation widget. Renders the embed div and loads GoFundMe's
 * embed script from a useEffect (never a <script> tag in JSX). If this
 * component added the script, it removes it again on unmount so a later
 * mount loads it fresh; the script replaces the div with its iframe when
 * it loads.
 */
export function GoFundMeEmbed() {
  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${EMBED_SCRIPT}"]`);
    const created = !existing;
    const script = existing ?? document.createElement("script");
    if (created) {
      script.src = EMBED_SCRIPT;
      script.async = true;
      document.body.appendChild(script);
    }
    return () => {
      if (created) script.remove();
    };
  }, []);

  return <div className="gfm-embed" data-url={WIDGET_URL} />;
}
