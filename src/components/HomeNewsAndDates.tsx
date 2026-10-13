import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getUpcomingFixtures } from "@/lib/fixtures";
import type { getHomeNews } from "@/lib/home-news.functions";

type NewsData = Awaited<ReturnType<typeof getHomeNews>>;

export function HomeNewsAndDates({ news, today }: { news: NewsData; today: string }) {
  const events = getUpcomingFixtures(new Date(today), 4);
  return (
    <section aria-labelledby="home-news-heading" className="bg-card py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="home-news-heading" className="font-serif text-3xl font-bold text-primary sm:text-4xl">Latest News &amp; Key Dates</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">Stay up to date with the latest club news, regatta results, and upcoming calendar events.</p>
        </div>
        <div className="mt-8 grid min-w-0 gap-8 md:grid-cols-2">
          <div className="min-w-0">
            <h3 className="mb-5 border-b-2 border-secondary pb-3 font-serif text-2xl font-bold text-primary">Recent News</h3>
            <div className="space-y-4">
              {news.posts.map((post) => (
                <Card key={post.id} className="grid min-w-0 grid-cols-1 gap-4 rounded-lg p-4 shadow-none sm:grid-cols-[112px_minmax(0,1fr)]">
                  <img src={post.thumbnail} alt={post.title} loading="lazy" width={112} height={112} className={`aspect-[16/9] w-full rounded-md sm:aspect-square ${post.thumbnail === "/muckross-logo.png" ? "object-contain" : "object-cover"}`} />
                  <div className="min-w-0">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:flex-wrap">
                      <Badge variant="secondary" className="w-fit">Club News</Badge>
                      <time dateTime={post.published_at} className="shrink-0 text-xs text-muted-foreground">{new Date(post.published_at).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Dublin" })}</time>
                    </div>
                    <h4 className="mt-3 break-words text-lg font-bold leading-snug text-primary">{post.title}</h4>
                    {post.excerpt && <p className="mt-2 line-clamp-3 break-words text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>}
                    <Button asChild variant="link" className="mt-2 h-8 px-0"><Link to="/news">Read story <ArrowRight aria-hidden="true" /></Link></Button>
                  </div>
                </Card>
              ))}
              {news.posts.length === 0 && <p role={news.unavailable ? "status" : undefined} className="py-6 text-sm text-muted-foreground">{news.unavailable ? "News is temporarily unavailable. Visit the News page to try again." : "No news articles published yet."}</p>}
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="mb-5 border-b-2 border-secondary pb-3 font-serif text-2xl font-bold text-primary">Upcoming Key Dates</h3>
            <ul className="divide-y divide-border">
              {events.map((event) => (
                <li key={event.name} className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 py-5 first:pt-0">
                  <time dateTime={`${event.date.getFullYear()}-${String(event.date.getMonth() + 1).padStart(2, "0")}-${String(event.date.getDate()).padStart(2, "0")}`} className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <span className="text-xs font-semibold uppercase text-secondary">{event.date.toLocaleDateString("en-IE", { month: "short" })}</span>
                    <span className="text-2xl font-bold">{String(event.date.getDate()).padStart(2, "0")}</span>
                  </time>
                  <div className="min-w-0">
                    <h4 className="break-words text-base font-bold leading-snug text-primary">{event.name}</h4>
                    <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground"><MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /><span className="min-w-0 break-words">{event.location}</span></p>
                  </div>
                </li>
              ))}
            </ul>
            {events.length === 0 && <p className="py-6 text-sm text-muted-foreground">No upcoming events scheduled. Check back soon.</p>}
            <Button asChild variant="link" className="mt-4 px-0"><Link to="/news" hash="regatta-calendar">View Full Calendar <ArrowRight aria-hidden="true" /></Link></Button>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <Button asChild size="lg" className="h-auto min-h-10 max-w-full whitespace-normal py-3 text-center"><Link to="/news">View All News &amp; Articles <ArrowRight aria-hidden="true" /></Link></Button>
        </div>
      </div>
    </section>
  );
}