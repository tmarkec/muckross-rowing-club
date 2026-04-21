import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SponsorStrip } from "./SponsorStrip";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SponsorStrip />
      <SiteFooter />
    </div>
  );
}