import { FadeIn } from "@/components/motion/fade-in";
import { NewsCard } from "@/components/news/news-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getNewsList, getNewsTags } from "@/lib/data/news";

export const metadata = {
  title: "KI Nachrichten | RoboRoman",
  description: "Aktuelle KI-News und Produktupdates aus dem DACH-Raum.",
};

export default async function NewsPage() {
  const [news, tags] = await Promise.all([getNewsList(), getNewsTags()]);

  return (
    <div className="space-y-8 lg:space-y-12">
      <FadeIn className="space-y-3">
        <p className="text-sm text-primary">KI Nachrichten</p>
        <h1 className="text-3xl font-semibold text-foreground">Aktuelle Meldungen</h1>
        <p className="text-muted-foreground">
          Die neuesten Updates zu KI-Produkten, Datenschutz und Trends aus dem DACH-Raum.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {tags.map((tag) => (
            <Badge key={tag.id} variant="muted">
              {tag.name}
            </Badge>
          ))}
        </div>
      </FadeIn>

      <Separator className="bg-white/5" />

      <div className="grid gap-4">
        {news.map((item) => (
          <NewsCard key={item.id} news={item} />
        ))}
        {!news.length && (
          <div className="rounded-xl border border-white/5 bg-black/40 p-6 text-muted-foreground">
            Keine Nachrichten gefunden.
          </div>
        )}
      </div>
    </div>
  );
}
