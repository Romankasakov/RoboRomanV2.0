import Link from "next/link";
import { ArrowRight, ExternalLink, LineChart, Newspaper, ShieldCheck, Star, Users } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const [
    toolCountResult,
    newsCountResult,
    memberCountResult,
    bookmarkCountResult,
    clickCountResult,
    recentToolsResult,
    recentNewsResult,
    recentClicksResult,
  ] = await Promise.all([
    supabase.from("tools").select("id", { head: true, count: "exact" }),
    supabase.from("news").select("id", { head: true, count: "exact" }),
    supabase.from("profiles").select("id", { head: true, count: "exact" }),
    supabase.from("bookmarks").select("id", { head: true, count: "exact" }),
    supabase.from("click_events").select("id", { head: true, count: "exact" }),
    supabase.from("tools").select("id, name, slug, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("news").select("id, title, slug, published_at").order("published_at", { ascending: false }).limit(5),
    supabase
      .from("click_events")
      .select("id, created_at, referrer, user_agent, tool_id, tools ( slug, name )")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    {
      label: "Tools im Verzeichnis",
      value: extractCount(toolCountResult),
      icon: <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />,
      href: "/admin/tools",
    },
    {
      label: "News-Beiträge",
      value: extractCount(newsCountResult),
      icon: <Newspaper className="h-5 w-5 text-primary" aria-hidden />,
      href: "/admin/news",
    },
    {
      label: "Mitglieder",
      value: extractCount(memberCountResult),
      icon: <Users className="h-5 w-5 text-primary" aria-hidden />,
      href: "/admin",
    },
    {
      label: "Bookmarks gesamt",
      value: extractCount(bookmarkCountResult),
      icon: <Star className="h-5 w-5 text-primary" aria-hidden />,
      href: "/mein-tool-stack",
    },
    {
      label: "Affiliate Klicks",
      value: extractCount(clickCountResult),
      icon: <LineChart className="h-5 w-5 text-primary" aria-hidden />,
      href: "/admin",
    },
  ];

  const recentTools = recentToolsResult.data ?? [];
  const recentNews = recentNewsResult.data ?? [];
  const recentClicks = recentClicksResult.data ?? [];

  return (
    <FadeIn className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-white/10 bg-black/30">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-semibold text-foreground">{formatNumber(stat.value)}</p>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">{stat.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/10 bg-black/30">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Lege neue Datensätze an oder prüfe die Live-Daten.</CardDescription>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin/tools">
                Tool erfassen
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/admin/news">
                News erfassen
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <ListCard
          title="Neu eingetroffene Tools"
          description="Latest Additions"
          emptyText="Noch keine Tools vorhanden."
        >
          {recentTools.map((tool) => (
            <ListItem
              key={tool.id}
              title={tool.name}
              meta={formatDate(tool.created_at)}
              href={`/tools/${tool.slug}`}
            />
          ))}
        </ListCard>

        <ListCard title="Aktuelle News" description="Chronologisch sortiert" emptyText="Noch keine News verfügbar.">
          {recentNews.map((news) => (
            <ListItem
              key={news.id}
              title={news.title}
              meta={formatDate(news.published_at)}
              href={`/news/${news.slug}`}
            />
          ))}
        </ListCard>
      </div>

      <Card className="border-white/10 bg-black/30">
        <CardHeader>
          <CardTitle>Affiliate & Outbound Aktivität</CardTitle>
          <CardDescription>Letzte Klick-Events aus /out/[slug]</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentClicks.length ? (
            recentClicks.map((click) => (
              <div key={click.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap justify-between gap-2 text-sm text-muted-foreground">
                  <span>{formatDate(click.created_at)}</span>
              <span>{formatReferrer(click.referrer)}</span>
                </div>
                <Separator className="my-3 bg-white/5" />
                <div className="flex flex-col gap-2 text-sm">
                  <p className="font-medium text-foreground">
                    Tool:{" "}
                    {click.tools?.slug ? (
                      <Link href={`/tools/${click.tools.slug}`} className="inline-flex items-center gap-1 text-primary">
                        {click.tools.name}
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    ) : (
                      "unbekannt"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">User-Agent: {click.user_agent ?? "k.A."}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Noch keine Klicks protokolliert.</p>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}

function extractCount(result: { count: number | null; error?: unknown } | null | undefined) {
  if (!result) return 0;
  if ("error" in result && result.error) {
    console.error("Admin dashboard count error:", result.error);
  }
  return "count" in result && typeof result.count === "number" ? result.count : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("de-DE").format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "n/a";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatReferrer(value: string | null | undefined) {
  if (!value) return "Direct";
  try {
    const url = new URL(value);
    return url.host || value;
  } catch {
    return value;
  }
}

function ListCard({
  title,
  description,
  emptyText,
  children,
}: {
  title: string;
  description?: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-black/30">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.isArray(children) && !children.length ? <p className="text-sm text-muted-foreground">{emptyText}</p> : children}
      </CardContent>
    </Card>
  );
}

function ListItem({ title, meta, href }: { title: string; meta: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-foreground transition hover:border-primary/30 hover:text-primary"
    >
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{meta}</p>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
    </Link>
  );
}
