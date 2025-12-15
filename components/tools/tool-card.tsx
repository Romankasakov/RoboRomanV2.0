"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import {
  BadgeCheck,
  Briefcase,
  ExternalLink,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Star,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ToolWithRelations } from "@/types/entities";
import { BookmarkButton } from "./bookmark-button";

type ToolCardProps = {
  tool: ToolWithRelations;
  className?: string;
  showBookmark?: boolean;
  initialBookmarked?: boolean;
  voteCounts?: { up: number; down: number };
};

export function ToolCard({ tool, className, showBookmark = true, initialBookmarked, voteCounts }: ToolCardProps) {
  const router = useRouter();

  const priceModels = normalizeList(tool.preismodell);
  const logoUrl = tool.logo ?? tool.logo_url;
  const thumbnailUrl = tool.thumbnail ?? tool.thumbnail_url;
  const partnerFlag = tool.partner_offer ?? tool.is_partner_offer;
  const overallRating = tool.community_rating ?? tool.rating_overall;
  const gdprRating = tool.gdpr_score ?? tool.rating_gdpr;
  const socialProofText = formatSocialProof(tool.social_proof);
  const hasDsgvoBadge = tool.avv_dpa === "yes" || tool.avv_dpa_statuses?.some((status) => status?.toLowerCase() === "yes");

  const featuredBadges = [
    tool.is_trending ? { label: "Trending", icon: TrendingUp } : null,
    tool.is_featured || tool.is_recommended ? { label: "Empfohlen", icon: Sparkles } : null,
    partnerFlag ? { label: "Partner", icon: BadgeCheck } : null,
    hasDsgvoBadge ? { label: "DSGVO", icon: ShieldCheck } : null,
    tool.is_new ? { label: "Neu", icon: Star } : null,
  ].filter(Boolean) as Array<{ label: string; icon: ComponentType<{ className?: string }> }>;

  const votes = voteCounts ?? { up: 0, down: 0 };

  return (
    <Card
      className={cn(
        "group relative cursor-pointer overflow-hidden border-white/10 bg-black/25 shadow-card transition hover:border-primary/25",
        className,
      )}
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/tools/${tool.slug}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(`/tools/${tool.slug}`);
        }
      }}
    >
      {showBookmark ? (
        <div className="absolute right-3 top-3 z-10" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          <BookmarkButton toolId={tool.id} toolSlug={tool.slug} initialBookmarked={initialBookmarked} />
        </div>
      ) : null}

      <div className="relative aspect-[16/9] w-full overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={tool.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,225,174,0.22)_0,transparent_55%),radial-gradient(circle_at_85%_10%,rgba(0,217,255,0.14)_0,transparent_50%),linear-gradient(135deg,#050b10_0%,#06141f_100%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-black/35 shadow-[0_0_0_1px_rgba(16,225,174,0.10)]">
                {logoUrl ? (
                  <Image src={logoUrl} alt={tool.name} fill className="object-cover" sizes="48px" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-primary">
                    {tool.name[0] ?? "?"}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <CardTitle className="truncate text-lg leading-snug text-foreground">{tool.name}</CardTitle>
                {featuredBadges.length ? (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {featuredBadges.slice(0, 3).map((item) => {
                      const Icon = item.icon;
                      return (
                        <Badge key={item.label} className="gap-1 border border-white/10 bg-black/35 text-foreground">
                          <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
                          {item.label}
                        </Badge>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
            {tool.tags?.length ? (
              <div className="flex flex-col items-end gap-2 text-xs">
                {tool.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag.id} className="border border-white/10 bg-black/45">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {tool.categories?.slice(0, 4).map((cat) => (
            <Badge key={cat.id} variant="muted" className="border border-white/10 bg-black/20">
              {cat.name}
            </Badge>
          ))}
        </div>

        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          {tool.kurzbeschreibung ?? tool.zusammenfassung ?? "Beschreibung folgt."}
        </CardDescription>

        {socialProofText ? (
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary/80">
            <Users className="h-3.5 w-3.5" aria-hidden />
            <span>{socialProofText}</span>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {tool.use_case ? (
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/15 px-2 py-1">
              <Briefcase className="h-3.5 w-3.5 text-primary" aria-hidden />
              {tool.use_case}
            </span>
          ) : null}
          {tool.plattform ? (
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/15 px-2 py-1">
              <MonitorSmartphone className="h-3.5 w-3.5 text-primary" aria-hidden />
              {tool.plattform}
            </span>
          ) : null}
          {priceModels[0] ? (
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/15 px-2 py-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              {priceModels[0]}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3 text-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-300" aria-hidden />
              {overallRating ? `${overallRating}` : "n/a"}
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              {gdprRating ? `${gdprRating}/10` : "n/a"}
            </span>
          </div>
          <div className="inline-flex gap-2 text-foreground">
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="h-4 w-4 text-primary" aria-hidden />
              {votes.up}
            </span>
            <span className="inline-flex items-center gap-1">
              <ThumbsDown className="h-4 w-4 text-muted-foreground" aria-hidden />
              {votes.down}
            </span>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          <Button asChild size="lg" className="w-full gap-2">
            <Link href={`/out/${tool.slug}`} prefetch={false} target="_blank" rel="noreferrer">
              {tool.cta_label ?? "Direkt besuchen"}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function normalizeList(value: unknown) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((entry) => String(entry).trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value
    .split(/[,;/|]/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function formatSocialProof(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  if (typeof record.custom === "string" && record.custom.trim()) return record.custom.trim();

  if (typeof record.users === "number") {
    const formatted = new Intl.NumberFormat("de-DE").format(record.users);
    return `${formatted}+ Nutzer:innen`;
  }

  if (typeof record.organizations === "number") {
    const formatted = new Intl.NumberFormat("de-DE").format(record.organizations);
    return `${formatted}+ Teams`;
  }

  return "";
}
