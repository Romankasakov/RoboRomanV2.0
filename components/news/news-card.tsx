import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { NewsWithTags } from "@/types/entities";

type NewsCardProps = {
  news: NewsWithTags;
  className?: string;
};

export function NewsCard({ news, className }: NewsCardProps) {
  return (
    <Link href={`/news/${news.slug}`} className="block">
      <Card
        className={cn(
          "group overflow-hidden border-white/5 bg-black/40 transition hover:-translate-y-[2px] hover:shadow-glow",
          className,
        )}
      >
        <div className="grid grid-cols-1 items-stretch gap-0 md:grid-cols-[200px,1fr]">
          {news.image_url ? (
            <div className="relative h-48 w-full overflow-hidden md:h-full">
              <Image
                src={news.image_url}
                alt={news.title}
                fill
                sizes="200px"
                className="object-cover transition duration-300 group-hover:scale-105"
                priority={false}
              />
            </div>
          ) : null}
          <div className="flex flex-col">
            <CardHeader className="flex-1 space-y-3">
              <CardTitle className="text-lg group-hover:text-primary">{news.title}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {news.excerpt ?? news.content?.slice(0, 160) ?? ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3 pb-5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                {new Date(news.published_at).toLocaleDateString("de-DE")}
              </div>
              {news.tags?.map((tag) => (
                <Badge key={tag.id} variant="muted">
                  {tag.name}
                </Badge>
              ))}
            </CardContent>
          </div>
        </div>
      </Card>
    </Link>
  );
}
