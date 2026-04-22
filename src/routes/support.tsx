import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Copy, Check, Wrench, Anchor, Fuel, ArrowRight, Mail, ExternalLink, Ticket, Calendar } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { LottoCountdown } from "@/components/LottoCountdown";

const LOTTO_URL = "https://clubs.clubforce.com/clubs/rowing-muckross-rowing-club-kerry/";

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

const sponsors = [
  { name: "Reeks Brewing Co.", tag: "Local Brewery" },
  { name: "Lough Leane Hotel", tag: "Hospitality" },
  { name: "Killarney Outdoors", tag: "Outdoor Gear" },
  { name: "Kerry Marine Supplies", tag: "Marine Equipment" },
  { name: "MacGillycuddy Insurance", tag: "Insurance" },
];

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
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/70">
              Why your support matters
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              The real cost of keeping crews on the water
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              From petrol for the safety launches to electricity bills, boathouse
              maintenance and the constant repair and replacement of boats, oars and
              ergometers — the running costs are relentless. Membership fees cover only
              part of what's needed to keep Muckross competing at the highest level.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-yellow shadow-yellow">
                <Fuel className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">Fuel & Running Costs</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Petrol for the safety launches, electricity, water and insurance — the
                day-to-day bills that keep the club open and our crews safe on the water.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-yellow shadow-yellow">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">Boathouse Maintenance</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Pontoons, doors, roofing and the small repairs that never stop — keeping
                the boathouse on Lough Leane in good working order year-round.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-yellow shadow-yellow">
                <Anchor className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">Boats, Oars & Ergs</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Repairs, replacement oars, new ergometers and — when the time comes — new
                racing shells. See current prices from{" "}
                <a
                  href="https://www.filippiboats.it/en/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Filippi <ExternalLink className="h-3 w-3" />
                </a>{" "}
                and{" "}
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

            <BankDetails />

            <div className="mt-8 rounded-xl bg-muted/60 p-4 text-center text-xs text-muted-foreground">
              Please use your name as the payment reference so we can thank you personally.
              For corporate sponsorship enquiries,{" "}
              <Link to="/contact" className="font-semibold text-primary underline-offset-4 hover:underline">
                get in touch
              </Link>
              .
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="bg-background py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/70">
              Thank you
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              Our sponsors
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Muckross Rowing Club is proudly supported by these local businesses.
              Their generosity keeps our crews on the water.
            </p>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {sponsors.map((s) => (
              <li
                key={s.name}
                className="group flex aspect-[5/3] flex-col items-center justify-center rounded-xl border border-border/70 bg-card px-3 py-3 text-center transition-all hover:-translate-y-0.5 hover:border-secondary hover:shadow-soft"
              >
                <span className="font-serif text-sm font-semibold leading-tight text-primary">
                  {s.name}
                </span>
                <span className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {s.tag}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-14 rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <h3 className="font-serif text-xl font-semibold text-foreground">
              Interested in becoming a sponsor?
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              Sponsorship packages are available for businesses who'd like to support the
              club and have their brand seen on our boats, kit and at regattas across Ireland.
            </p>
            <a
              href="mailto:info@muckrossrowingclub.ie?subject=Sponsorship%20enquiry"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Mail className="h-4 w-4" /> Enquire about sponsorship <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function BankDetails() {
  const [copied, setCopied] = useState<string | null>(null);

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
    <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-background">
      <div className="border-b border-border bg-muted/40 px-5 py-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Bank Transfer Details
        </span>
      </div>
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
    </div>
  );
}