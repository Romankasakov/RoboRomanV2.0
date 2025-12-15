import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getNewsBySlug } from "@/lib/data/news";

type NewsDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) return notFound();

  const sources =
    typeof news.sources === "object" && news.sources && !Array.isArray(news.sources)
      ? (news.sources as Record<string, string>)
      : null;

  return (
    <div className="space-y-8 lg:space-y-12">
      <Link href="/news" className="flex items-center gap-2 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Zurück zu Nachrichten
      </Link>

      <FadeIn className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          {new Date(news.published_at).toLocaleDateString("de-DE")}
          {news.tags?.map((tag) => (
            <Badge key={tag.id} variant="muted">
              {tag.name}
            </Badge>
          ))}
        </div>
        <h1 className="text-3xl font-semibold text-foreground">{news.title}</h1>
        <p className="text-lg text-muted-foreground">{news.excerpt}</p>
      </FadeIn>

      {news.image_url ? (
        <div className="overflow-hidden rounded-2xl border border-white/5 shadow-card">
          <Image
            src={news.image_url}
            alt={news.title}
            width={1280}
            height={640}
            className="h-auto w-full object-cover"
            priority
          />
        </div>
      ) : null}

      <Card className="border-white/5 bg-black/40">
        <CardContent className="prose prose-invert max-w-none space-y-4 text-muted-foreground">
          {news.content?.split("\n").map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </CardContent>
      </Card>

      <Separator className="bg-white/5" />

      {sources ? (
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {Object.entries(sources).map(([key, value]) =>
            typeof value === "string" ? (
              <Link key={key} href={value} target="_blank" className="text-primary hover:underline">
                Quelle: {key}
              </Link>
            ) : null,
          )}
        </div>
      ) : null}
    </div>
  );
}
