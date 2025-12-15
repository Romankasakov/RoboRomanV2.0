import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, ShieldCheck, Star, ThumbsDown, ThumbsUp, Users, Vote } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { getToolBySlug, getTools } from "@/lib/data/tools";
import { getToolVoteCounts } from "@/lib/data/tool-votes";

type ToolDetailProps = {
  params: Promise<{ slug: string }>;
};

export default async function ToolDetailPage({ params }: ToolDetailProps) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return notFound();

  const voteCounts = await getToolVoteCounts([tool.id]);
  const votes = voteCounts[tool.id] ?? { up: 0, down: 0 };

  const similar = await getTools({
    tags: tool.tags?.map((t) => t.slug),
    limit: 3,
  });
  const dataTypeEntries = extractEntries(tool.data_types);
  const securityEntries = extractEntries(tool.security_measures);
  const sourceLinks = normalizeSources(tool.sources);
  const thumbnailUrl = tool.thumbnail ?? tool.thumbnail_url;
  const logoUrl = tool.logo ?? tool.logo_url;
  const overallRating = tool.community_rating ?? tool.rating_overall;
  const gdprRating = tool.gdpr_score ?? tool.rating_gdpr;
  const socialProofText = formatSocialProof(tool.social_proof);
  const ctaLabel = tool.cta_label ?? "Direkt besuchen";
  const avvStatuses = ensureStringArray(tool.avv_dpa_statuses);
  const hostingRegions = ensureStringArray(tool.hosting_regions);
  const hasDataSecurityDetails = Boolean(
    dataTypeEntries.length || securityEntries.length || tool.data_type_notes || tool.security_notes,
  );
  const primaryAvvValue = formatStatusValue(avvStatuses[0] ?? tool.avv_dpa ?? "unknown");
  const primaryHostingValue = hostingRegions.length
    ? hostingRegions.map((value) => formatStatusValue(value)).join(", ")
    : formatStatusValue(tool.hosting_region ?? "unknown");
  const primaryRiskValue = formatStatusValue(tool.risk_level ?? "medium");

  return (
    <div className="space-y-8 lg:space-y-10">
      <Link href="/" className="flex items-center gap-2 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Zurück zur Übersicht
      </Link>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/25 shadow-card">
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={tool.name}
                width={1400}
                height={780}
                className="h-auto w-full object-cover"
                priority
              />
            ) : (
              <div className="aspect-[16/9] w-full bg-[radial-gradient(circle_at_20%_20%,rgba(16,225,174,0.22)_0,transparent_55%),radial-gradient(circle_at_85%_10%,rgba(0,217,255,0.14)_0,transparent_50%),linear-gradient(135deg,#050b10_0%,#06141f_100%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <div className="flex items-end gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/35">
                  {logoUrl ? (
                    <Image src={logoUrl} alt={tool.name} fill sizes="56px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-primary">
                      {tool.name[0] ?? "?"}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="text-balance text-3xl font-semibold leading-tight text-foreground lg:text-4xl">
                    {tool.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tool.categories?.slice(0, 3).map((cat) => (
                      <Badge key={cat.id} variant="muted" className="border border-white/10 bg-black/25">
                        {cat.name}
                      </Badge>
                    ))}
                    {tool.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag.id} variant="outline" className="border-white/10 bg-white/5">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ScoreBox title="Gesamtbewertung" icon={<Star className="h-5 w-5 text-primary" aria-hidden />}>
              {overallRating ? `${overallRating}/5` : "n/a"}
            </ScoreBox>
            <ScoreBox title="DSGVO-Score" icon={<ShieldCheck className="h-5 w-5 text-primary" aria-hidden />}>
              {gdprRating ? `${gdprRating}/10` : "n/a"}
            </ScoreBox>
          </div>

          <Card className="border-white/10 bg-black/25">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-primary/10 text-primary">
                <FileText className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle>Beschreibung</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
              {tool.beschreibung ?? tool.kurzbeschreibung ?? tool.zusammenfassung ?? "Beschreibung folgt."}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/25">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
                <CardTitle>DSGVO & Datenschutz Analyse</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <DsgvoRow
                label="AVV / DPA"
                value={formatStatusValue(tool.avv_dpa ?? "unknown")}
                detail={tool.avv_dpa_details}
              />
              <DsgvoRow
                label="Hosting Region"
                value={formatStatusValue(tool.hosting_region ?? "unknown")}
                detail={tool.hosting_region_details}
              />
              <DsgvoRow label="Risiko" value={formatStatusValue(tool.risk_level ?? "medium")} detail={tool.risk_level_details} />
              <p className="text-xs text-muted-foreground">
                Keine Rechtsberatung. Prüfe immer die Datenschutzerklärung und Vertragsdokumente des Anbieters.
              </p>
            </CardContent>
          </Card>

          {hasDataSecurityDetails ? (
            <Card className="border-white/10 bg-black/25">
              <CardHeader>
                <CardTitle>Daten & Sicherheit</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                {dataTypeEntries.length || tool.data_type_notes ? (
                  <PolicySection title="Verarbeitete Daten" entries={dataTypeEntries} note={tool.data_type_notes} />
                ) : null}
                {securityEntries.length || tool.security_notes ? (
                  <PolicySection title="Security Measures" entries={securityEntries} note={tool.security_notes} />
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <CommunityVotesCard votes={votes} total={votes.up + votes.down} />
        </div>

        <div className="space-y-6 lg:col-span-4">
          <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-[#041b17] via-[#031415] to-black shadow-card">
            <div className="relative p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Jetzt testen</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">Direkter Zugriff</h2>
              <p className="mt-2 text-sm text-muted-foreground">Öffne das Tool direkt und teste, wie gut es passt.</p>

              <div className="mt-4">
                <MagneticButton className="inline-block w-full">
                  <Button
                    asChild
                    size="lg"
                    className="group relative w-full overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/20 via-primary/40 to-cyan-400/30 px-6 py-6 text-lg font-semibold text-foreground shadow-[0_10px_45px_-20px_rgba(16,225,174,0.8)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_25px_60px_-20px_rgba(16,225,174,0.8)]"
                  >
                    <Link href={`/out/${tool.slug}`} prefetch={false} target="_blank" rel="noreferrer">
                      {ctaLabel}
                      <ExternalLink className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                    </Link>
                  </Button>
                </MagneticButton>
                {socialProofText ? (
                  <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary">
                    <Users className="h-3.5 w-3.5" aria-hidden />
                    {socialProofText}
                  </p>
                ) : null}
                <p className="mt-3 text-xs text-primary/90">
                  Hinweis: Manche Links sind Affiliate-Links. Für dich bleibt der Preis gleich.
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-white/10 bg-black/25">
            <CardHeader>
              <CardTitle>Kategorien & Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <InfoPill label="Preismodell" value={tool.preismodell ?? "n/a"} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Kategorien</p>
                <div className="flex flex-wrap gap-2">
                  {tool.categories?.length ? (
                    tool.categories.map((cat) => (
                      <Badge key={cat.id} variant="muted" className="border border-white/10 bg-black/25">
                        {cat.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Keine Kategorien hinterlegt.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Besondere Merkmale</p>
                <div className="flex flex-wrap gap-2">
                  {tool.tags?.length ? (
                    tool.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="border-white/10 bg-white/5">
                        {tag.name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Keine Tags hinterlegt.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-gradient-to-br from-black/40 via-black/30 to-[#0b1f2b] shadow-card sm:max-w-sm">
            <CardHeader>
              <CardTitle>DSGVO Kurzcheck</CardTitle>
              <CardDescription>Zusammenfassung der wichtigsten Punkte.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <MiniStat label="AVV Status" value={primaryAvvValue} />
                <MiniStat label="Hosting Regionen" value={primaryHostingValue} />
                <MiniStat label="Risiko Level" value={primaryRiskValue} />
              </div>

              <Separator className="bg-white/5" />
              <p className="text-xs text-muted-foreground">
                Keine Rechtsberatung. Prüfe immer die Datenschutzerklärung und Vertragsdokumente des Anbieters.
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/25">
            <CardHeader>
              <CardTitle>Offizielle Quellen</CardTitle>
              <CardDescription>Nachweise aus dem Tool-Datensatz.</CardDescription>
            </CardHeader>
            <CardContent>
              <SourceList sources={sourceLinks} />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/25">
            <CardHeader>
              <CardTitle>Ähnliche Tools</CardTitle>
              <CardDescription>Basierend auf Tags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {similar
                .filter((t) => t.slug !== tool.slug)
                .slice(0, 3)
                .map((item) => (
                  <Link
                    key={item.id}
                    href={`/tools/${item.slug}`}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 transition hover:border-primary/30 hover:text-foreground"
                  >
                    <span className="truncate">{item.name}</span>
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </Link>
                ))}
              {!similar.length && <p className="text-sm text-muted-foreground">Keine ähnlichen Einträge.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function DsgvoRow({ label, value, detail }: { label: string; value: string; detail?: string | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
    </div>
  );
}

function CommunityVotesCard({ votes, total }: { votes: { up: number; down: number }; total: number }) {
  return (
    <Card className="border-white/10 bg-black/25">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2">
          <Vote className="h-4 w-4 text-primary" aria-hidden />
          Community Votes
        </CardTitle>
        <p className="text-xs text-muted-foreground">Feedback & Bewertung (Feature bald verfügbar)</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Gesamt</span>
          <span className="font-semibold text-foreground">{total}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex h-8 min-w-[88px] items-center justify-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
            aria-label="Upvote (coming soon)"
          >
            <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
            {votes.up}
          </button>
          <button
            type="button"
            className="inline-flex h-8 min-w-[88px] items-center justify-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:text-primary"
            aria-label="Downvote (coming soon)"
          >
            <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
            {votes.down}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreBox({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{children}</p>
        </div>
        <div className="mt-1 flex shrink-0 items-start justify-end">{icon}</div>
      </div>
    </div>
  );
}

type JsonEntry = { key: string; value: string };
type SourceLinkItem = { label: string; url: string };

function PolicySection({ title, entries, note }: { title: string; entries: JsonEntry[]; note?: string | null }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {entries.length ? (
        <dl className="space-y-2">
          {entries.map((entry) => (
            <div
              key={`${title}-${entry.key}-${entry.value}`}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2"
            >
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">{entry.key}</dt>
              <dd className="text-sm text-foreground">{entry.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-muted-foreground">Keine Angaben.</p>
      )}
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}

function SourceList({ sources }: { sources: SourceLinkItem[] }) {
  if (!sources.length) {
    return <p className="text-sm text-muted-foreground">Keine Quellen hinterlegt.</p>;
  }

  return (
    <div className="space-y-2">
      {sources.map((source) => (
        <Link
          key={`${source.label}-${source.url}`}
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-primary transition hover:border-primary/30 hover:text-foreground"
        >
          <span>{source.label}</span>
          <ExternalLink className="h-4 w-4" aria-hidden />
        </Link>
      ))}
    </div>
  );
}

function extractEntries(value: unknown): JsonEntry[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        const formatted = formatJsonValue(item);
        return formatted ? { key: `Eintrag ${index + 1}`, value: formatted } : null;
      })
      .filter((item): item is JsonEntry => Boolean(item));
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => {
        const formatted = formatJsonValue(entry);
        return formatted ? { key: humanizeKey(key), value: formatted } : null;
      })
      .filter((item): item is JsonEntry => Boolean(item));
  }

  const formatted = formatJsonValue(value);
  return formatted ? [{ key: "Info", value: formatted }] : [];
}

function formatJsonValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value
      .map((item) => formatJsonValue(item))
      .filter(Boolean)
      .join(", ");
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => `${humanizeKey(key)}: ${formatJsonValue(entry)}`)
      .filter(Boolean)
      .join("; ");
  }
  if (typeof value === "boolean") return value ? "Ja" : "Nein";
  return String(value);
}

function humanizeKey(value: string) {
  const cleaned = value.replace(/[_-]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return "Info";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function normalizeSources(value: unknown): SourceLinkItem[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const record = value as Record<string, unknown>;
  const knownLabels: Record<string, string> = {
    privacy_policy: "Datenschutzerklaerung",
    dpa: "Auftragsverarbeitung",
    security: "Security Dokumentation",
  };
  const sources: SourceLinkItem[] = [];

  for (const [key, label] of Object.entries(knownLabels)) {
    const url = record[key];
    if (typeof url === "string" && url.trim()) {
      sources.push({ label, url });
    }
  }

  for (const [key, entry] of Object.entries(record)) {
    if (knownLabels[key]) continue;
    if (typeof entry !== "string" || !entry.trim()) continue;
    sources.push({ label: humanizeKey(key), url: entry });
  }

  return sources;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-primary/15 bg-black/30 px-3 py-2 text-center shadow-[0_0_25px_rgba(16,225,174,0.08)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/70">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ensureStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter((entry): entry is string => Boolean(entry));
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,;/|]/g)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
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

function formatStatusValue(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "yes") return "Ja";
  if (normalized === "no") return "Nein";
  if (normalized === "unknown") return "Unklar";
  return value
    .split(/[\s-_]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
