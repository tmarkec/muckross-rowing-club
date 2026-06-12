import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Download, Users } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

export const Route = createFileRoute("/club-info")({
  head: () => ({
    meta: [
      { title: "Club Info — Muckross Rowing Club" },
      { name: "description", content: "Club documents, policies and the people who keep Muckross Rowing Club running." },
      { property: "og:title", content: "Club Info — Muckross Rowing Club" },
      { property: "og:description", content: "Club documents, policies and the committee behind Muckross Rowing Club." },
    ],
  }),
  component: ClubInfoPage,
});

const documents = [
  { title: "Code of Behaviour", body: "Standards of conduct expected of members, coaches and supporters." },
  { title: "Child Safeguarding Statement", body: "How we protect and support our junior rowers." },
  { title: "Health & Safety Policy", body: "On-water and boathouse safety procedures." },
  { title: "Club Constitution", body: "The rules and governance framework that the club operates under." },
  { title: "Anti-Bullying Policy", body: "Our commitment to a respectful, bullying-free environment for all members." },
  { title: "Membership Form & Fees Schedule", body: "Join the club and view current annual membership fees." },
  { title: "Incident / Accident Report Form", body: "Used to log any on-water or boathouse incidents for review." },
];

const people = [
  { role: "Club President", name: "Sharon Cooper" },
  { role: "Club Secretary", name: "Trish McCarthy" },
  { role: "Safeguarding Officer", name: "Marko Tot" },
  { role: "Club Captain", name: "TBC" },
  { role: "Treasurer", name: "Trish McCarthy" },
  { role: "PRO Officer", name: "Timmy" },
];

function ClubInfoPage() {
  return (
    <SiteLayout>
      <section className="bg-gradient-navy py-12 text-primary-foreground sm:py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h1 className="font-serif text-3xl font-bold sm:text-4xl">Club Info</h1>
          <p className="mt-3 text-base text-primary-foreground/85 sm:text-lg">
            Documents, policies and the people behind Muckross Rowing Club.
          </p>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-elegant">
              <FileText className="h-6 w-6 text-secondary" />
            </div>
            <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/70">
              Governance
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              Club documents & policies
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              Muckross Rowing Club is committed to providing a safe, welcoming and
              well-governed environment for all members. Our key policy documents are
              available to download below.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {documents.map((doc) => (
              <li key={doc.title}>
                <a
                  href="#"
                  className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-secondary hover:shadow-elegant"
                >
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-gradient-yellow shadow-yellow">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif text-base font-semibold text-foreground">{doc.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{doc.body}</p>
                    <span className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      PDF · Coming soon
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-muted/40 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-elegant">
              <Users className="h-6 w-6 text-secondary" />
            </div>
            <span className="mt-5 block text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground/70">
              The committee
            </span>
            <h2 className="mt-2 font-serif text-3xl font-bold text-foreground sm:text-4xl">
              People who keep us rowing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              A small group of volunteers, coaches and committee members keep the club
              running week in, week out.
            </p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((p) => (
              <li key={p.role} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {p.role}
                </p>
                <p className="mt-1 font-serif text-lg font-semibold text-foreground">{p.name}</p>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            For governance enquiries or to request a document,{" "}
            <Link to="/contact" className="font-semibold text-primary underline-offset-4 hover:underline">
              get in touch
            </Link>.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}