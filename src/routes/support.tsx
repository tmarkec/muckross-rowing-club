import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Copy, Check, ArrowRight, ExternalLink, Ticket, Calendar, CreditCard, Users, HandHeart, Wrench, Megaphone, ClipboardList, Trophy, GraduationCap, HeartHandshake, Building2 } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { LottoCountdown } from "@/components/LottoCountdown";

const LOTTO_URL = "https://clubs.clubforce.com/clubs/rowing-muckross-rowing-club-kerry/";
// TODO: Replace with real Stripe / iDonate.ie / GoFundMe link when payments are set up.
const DONATE_URL = "#donate-bank";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support the Club — Muckross Rowing Club" },
      { name: "description", content: "Support Muckross Rowing Club. Thank our sponsors and help us keep rowing on Lough Leane through donations and partnerships." },
      { property: "og:title", content: "Support Muckross Rowing Club" },
      { property: "og:description", content: "Sponsors, donations and how you can help keep Muckross rowing strong on Lough Leane." },
    ],
  }),
  component: SupportPage,
});

const bank = {
  accountName: "Muckross Rowing Club",
  iban: "IE00 BOFI 0000 0000 0000 00",
  bic: "BOFIIE2DXXX",
  bankName: "Bank of Ireland, Killarney",
};

function SupportPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-gradient-navy py-20 text-primary-foreground sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            Sponsors & Donations
          </span>
          <h1 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">
            Support Muckross
          </h1>
          <p className="mt-5 text-lg text-primary-foreground/85">
            Every stroke on Lough Leane is made possible by the businesses, families and
            supporters who stand behind the club.
          </p>
        </div>
      </section>

      {/* Why we need support */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/70">
              Why your support matters
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              The real cost of keeping crews on the water
            </h2>
            <div className="mt-6 space-y-4 text-left text-base leading-relaxed text-muted-foreground sm:text-[1.0625rem]">
              <p>
                Running a rowing club is relentless work behind the scenes. Our biggest
                ongoing cost is petrol for the safety launches that follow every crew on
                the water, closely followed by the regular bills — electricity, water,
                insurance — that keep the boathouse open year-round.
              </p>
              <p>
                Then there's the constant small maintenance: pontoons, doors, roofing
                and the dozens of repairs that never stop on a building sat on the
                shore of Lough Leane. And of course the equipment itself — boat
                repairs, replacement oars, new ergometers and, when the time comes,
                new racing shells from{" "}
                <a
                  href="https://www.filippiboats.it/en/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Filippi <ExternalLink className="h-3 w-3" />
                </a>{" "}
                or training gear from{" "}
                <a
                  href="https://www.concept2.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Concept2 <ExternalLink className="h-3 w-3" />
                </a>
                .
              </p>
              <p>
                Membership fees cover only part of it. Every donation and sponsorship
                helps keep Muckross competing at the highest level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Donate */}
      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-elegant sm:p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-yellow shadow-yellow">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h2 className="mt-5 font-serif text-3xl font-bold text-foreground sm:text-4xl">
                Make a donation
              </h2>
              <p className="mt-3 max-w-xl text-base text-muted-foreground">
                Donations of any size are gratefully received and go directly toward boats,
                equipment and maintaining the club for the next generation. Bank transfer
                is the simplest way to give.
              </p>
            </div>

            {/* Primary CTA — card / online donation */}
            <div className="mt-8 flex flex-col items-center">
              <a
                href={DONATE_URL}
                className="group inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-elegant transition-all hover:scale-[1.02] hover:bg-primary/90 sm:text-lg"
              >
                <CreditCard className="h-5 w-5" />
                Donate by Card
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <p className="mt-3 text-xs text-muted-foreground">
                Secure online payment · Apple Pay · Google Pay
              </p>
            </div>

            {/* Secondary — bank transfer */}
            <BankTransferDetails />

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Please use your name as the payment reference so we can thank you personally.
            </p>

            {/* Become a sponsor — businesses */}
            <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/40 p-6 sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary shadow-elegant">
                  <Building2 className="h-5 w-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-semibold text-foreground">
                    Become a sponsor
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Sponsorship packages are available for businesses who'd like to support
                    the club. Get in touch to chat about ways to work together.
                  </p>
                  <Link
                    to="/contact"
                    className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Enquire about sponsorship <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Muckross Lotto */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-gradient-yellow p-8 shadow-yellow sm:p-12">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-elegant">
                <Ticket className="h-6 w-6 text-secondary" />
              </div>
              <span className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                Community fundraiser
              </span>
              <h2 className="mt-2 font-serif text-3xl font-bold text-primary sm:text-4xl">
                Muckross Lotto
              </h2>
              <p className="mt-3 max-w-xl text-base text-primary/80">
                Play the Muckross Lotto to support the club and be in with a chance to win.
                Draw every Saturday at 8:00 PM.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                <Calendar className="h-3.5 w-3.5" />
                Next draw — Saturday, 8:00 PM
              </div>

              <div className="w-full max-w-md">
                <LottoCountdown />
              </div>

              <a
                href={LOTTO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
              >
                <Ticket className="h-4 w-4" /> Play the Lotto <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-3 text-[11px] text-primary/60">
                Play responsibly. Must be 18+ to enter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteering */}
      <section id="volunteering" className="bg-muted/40 py-20 scroll-mt-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-elegant">
              <HandHeart className="h-6 w-6 text-secondary" />
            </div>
            <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/70">
              Get involved
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              Volunteering
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Volunteering is at the heart of Muckross Rowing Club. It's what underpins the club's
              success and what enables every rower and cox to realise their ambition on the water.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Whether you're a new member, a parent or guardian of a junior, a life-long member,
              a lover of sport, or a friend of Muckross — your help from time to time is greatly
              appreciated. There's so much to choose from…
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Trophy, title: "Rowing events", body: "Help run regattas, time trials and club race days." },
              { icon: Megaphone, title: "Fundraising & celebrations", body: "Lend a hand at fundraisers, dinners and club socials." },
              { icon: ClipboardList, title: "Administration & management", body: "Committee work, communications and day-to-day running." },
              { icon: GraduationCap, title: "Coaching & training support", body: "Assist coaches on the bank, in the gym or in the launch." },
              { icon: Users, title: "Regatta logistics", body: "Boat trailers, equipment, food and travel for race days." },
              { icon: Wrench, title: "Facilities & equipment", body: "Boathouse upkeep, boat repairs and pontoon maintenance." },
              { icon: HeartHandshake, title: "Rower wellbeing", body: "Welfare, mentoring and supporting our junior rowers." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gradient-yellow shadow-yellow">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Volunteer with Muckross <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function BankTransferDetails() {
  const [copied, setCopied] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // ignore
    }
  };

  const rows: { label: string; value: string; copyable?: boolean }[] = [
    { label: "Account Name", value: bank.accountName },
    { label: "IBAN", value: bank.iban, copyable: true },
    { label: "BIC", value: bank.bic, copyable: true },
    { label: "Bank", value: bank.bankName },
  ];

  return (
    <div id="donate-bank" className="mt-6 overflow-hidden rounded-2xl border border-border bg-background scroll-mt-24">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 border-b border-border bg-muted/40 px-5 py-3 text-left transition-colors hover:bg-muted/60"
        aria-expanded={open}
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Prefer bank transfer? Show details
        </span>
        <ArrowRight
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {row.label}
              </dt>
              <dd className="mt-1 break-all font-mono text-sm font-medium text-foreground sm:text-base">
                {row.value}
              </dd>
            </div>
            {row.copyable && (
              <button
                type="button"
                onClick={() => copy(row.label, row.value)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-secondary hover:bg-muted"
                aria-label={`Copy ${row.label}`}
              >
                {copied === row.label ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-primary" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </dl>
      )}
    </div>
  );
}