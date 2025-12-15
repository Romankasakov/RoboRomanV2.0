"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BarChart3,
  Bot,
  Code2,
  Filter,
  Gem,
  Image as ImageIcon,
  Languages,
  Mail,
  Megaphone,
  MessageCircle,
  Palette,
  PenSquare,
  Shield,
  Sparkles,
  Tags,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToolCard } from "@/components/tools/tool-card";
import { cn } from "@/lib/utils";
import type { CategoryRecord, TagRecord, ToolWithRelations } from "@/types/entities";

type ToolExplorerProps = {
  tools: ToolWithRelations[];
  categories: CategoryRecord[];
  tags: TagRecord[];
  voteCounts?: Record<string, { up: number; down: number }>;
  initialLimit?: number;
};

export function ToolExplorer({ tools, categories, tags, voteCounts, initialLimit = 30 }: ToolExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const reduceMotion = useReducedMotion();

  const priceFilters = useMemo(() => {
    const uniq = new Map<string, string>();
    for (const tool of tools) {
      for (const entry of normalizeList((tool as unknown as { preismodell?: unknown }).preismodell)) {
        const key = entry.toLowerCase();
        if (!uniq.has(key)) uniq.set(key, entry);
      }
    }

    const ranked = Array.from(uniq.values());
    ranked.sort((a, b) => a.localeCompare(b, "de-DE"));
    return ranked.map((name) => ({ slug: name.toLowerCase(), name }));
  }, [tools]);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<string>;
      setSearchTerm(String(custom.detail || ""));
    };

    window.addEventListener("roboroman:search", handler as EventListener);
    return () => window.removeEventListener("roboroman:search", handler as EventListener);
  }, []);

  const filtered = useMemo(() => {
    let list = [...tools];
    const term = searchTerm.trim().toLowerCase();

    if (term) {
      list = list.filter(
        (tool) =>
          tool.name.toLowerCase().includes(term) ||
          tool.kurzbeschreibung?.toLowerCase().includes(term) ||
          tool.beschreibung?.toLowerCase().includes(term)
      );
    }
    if (selectedCategories.length) {
      list = list.filter((tool) => tool.categories?.some((cat) => selectedCategories.includes(cat.slug)));
    }
    if (selectedTags.length) {
      list = list.filter((tool) => tool.tags?.some((tag) => selectedTags.includes(tag.slug)));
    }
    if (selectedPrices.length) {
      list = list.filter((tool) => {
        const models = normalizeList((tool as unknown as { preismodell?: unknown }).preismodell).map((m) => m.toLowerCase());
        return selectedPrices.some((price) => models.some((model) => model.includes(price.toLowerCase())));
      });
    }
    return list;
  }, [tools, searchTerm, selectedCategories, selectedTags, selectedPrices]);

  const toggle = (value: string, list: string[], setter: (val: string[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const displayed = filtered.slice(0, initialLimit);
  const hasActiveFilters =
    Boolean(searchTerm.trim()) || selectedCategories.length > 0 || selectedTags.length > 0 || selectedPrices.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        {hasActiveFilters ? (
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => {
              setSearchTerm("");
              toggleAll(setSelectedCategories, setSelectedTags, setSelectedPrices);
            }}
          >
            Filter zurücksetzen
          </Button>
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/25 p-4 shadow-card backdrop-blur-xl sm:p-6">
        <div className="space-y-5">
          <FilterGroup
            label="Kategorien"
            labelIcon={<FilterIcon icon={<Sparkles className="h-4 w-4" aria-hidden />} />}
            items={categories}
            selected={selectedCategories}
            onToggle={(slug) => toggle(slug, selectedCategories, setSelectedCategories)}
            iconFor={(slug) => categoryIcon(slug)}
          />
          {priceFilters.length ? (
            <FilterGroup
              label="Preismodell"
              labelIcon={<FilterIcon icon={<Gem className="h-4 w-4" aria-hidden />} />}
              items={priceFilters}
              selected={selectedPrices}
              onToggle={(slug) => toggle(slug, selectedPrices, setSelectedPrices)}
              iconFor={(slug) => priceIcon(slug)}
            />
          ) : null}
          <FilterGroup
            label="Besondere Merkmale"
            labelIcon={<FilterIcon icon={<Shield className="h-4 w-4" aria-hidden />} />}
            items={tags}
            selected={selectedTags}
            onToggle={(slug) => toggle(slug, selectedTags, setSelectedTags)}
            iconFor={(slug) => tagIcon(slug)}
          />
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {displayed.map((tool) => (
            <motion.div
              key={tool.id}
              layout
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
            >
              <ToolCard tool={tool} voteCounts={voteCounts?.[tool.id]} />
            </motion.div>
          ))}
          {!tools.length && (
            <div className="col-span-full rounded-xl border border-white/5 bg-black/30 p-6 text-center text-muted-foreground">
              Keine Tools gefunden.
            </div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}

type FilterGroupProps = {
  label: string;
  labelIcon?: React.ReactNode;
  items: { slug: string; name: string }[];
  selected: string[];
  onToggle: (slug: string) => void;
  iconFor?: (slug: string) => React.ReactNode;
};

function FilterGroup({ label, labelIcon, items, selected, onToggle, iconFor }: FilterGroupProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        {labelIcon ?? <Filter className="h-4 w-4 text-primary" />}
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.slug}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-1 text-sm transition",
              selected.includes(item.slug)
                ? "border-primary/35 bg-primary/10 text-foreground shadow-[0_0_0_1px_rgba(16,225,174,0.12),0_10px_35px_-20px_rgba(16,225,174,0.65)]"
                : "border-white/10 bg-black/25 text-muted-foreground hover:border-primary/25 hover:text-foreground"
            )}
            onClick={() => onToggle(item.slug)}
            type="button"
          >
            {iconFor ? (
              <span className="grid h-6 w-6 place-items-center rounded-lg border border-white/10 bg-white/5 text-primary/90">
                {iconFor(item.slug)}
              </span>
            ) : null}
            <span className="truncate">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/5 text-primary shadow-[0_0_0_1px_rgba(16,225,174,0.12)]">
      {icon}
    </span>
  );
}

function toggleAll(
  resetCategories: (val: string[]) => void,
  resetTags: (val: string[]) => void,
  resetPrices: (val: string[]) => void
) {
  resetCategories([]);
  resetTags([]);
  resetPrices([]);
}

export function ToolExplorerSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full rounded-2xl" />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Skeleton key={idx} className="h-64 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function categoryIcon(slug: string) {
  const iconClass = "h-3.5 w-3.5";
  switch (slug) {
    case "ki-erkennung":
      return <Shield className={iconClass} aria-hidden />;
    case "automatisierung-agenten":
      return <Bot className={iconClass} aria-hidden />;
    case "content-erstellung":
      return <PenSquare className={iconClass} aria-hidden />;
    case "bildgenerierung":
      return <ImageIcon className={iconClass} aria-hidden />;
    case "code-generierung":
      return <Code2 className={iconClass} aria-hidden />;
    case "marketing-seo":
      return <Megaphone className={iconClass} aria-hidden />;
    case "chatbots-assistenten":
      return <MessageCircle className={iconClass} aria-hidden />;
    case "email-kommunikation":
      return <Mail className={iconClass} aria-hidden />;
    case "uebersetzung":
      return <Languages className={iconClass} aria-hidden />;
    case "design-kreativitaet":
      return <Palette className={iconClass} aria-hidden />;
    case "datenanalyse":
      return <BarChart3 className={iconClass} aria-hidden />;
    default:
      return <Sparkles className={iconClass} aria-hidden />;
  }
}

function tagIcon(slug: string) {
  const iconClass = "h-3.5 w-3.5";
  switch (slug) {
    case "trending":
      return <TrendingUp className={iconClass} aria-hidden />;
    case "neu":
      return <Sparkles className={iconClass} aria-hidden />;
    case "dsgvo-konform":
      return <Shield className={iconClass} aria-hidden />;
    default:
      return <Tags className={iconClass} aria-hidden />;
  }
}

function priceIcon(slug: string) {
  const iconClass = "h-3.5 w-3.5";
  if (slug.includes("open")) return <Code2 className={iconClass} aria-hidden />;
  if (slug.includes("frei")) return <Sparkles className={iconClass} aria-hidden />;
  if (slug.includes("kosten")) return <Sparkles className={iconClass} aria-hidden />;
  if (slug.includes("bezahl")) return <TrendingUp className={iconClass} aria-hidden />;
  return <Sparkles className={iconClass} aria-hidden />;
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
