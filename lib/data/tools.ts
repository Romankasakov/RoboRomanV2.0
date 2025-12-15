import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { CategoryRecord, TagRecord, ToolRecord, ToolWithRelations } from "@/types/entities";

type ToolFilters = {
  search?: string;
  categories?: string[];
  tags?: string[];
  preismodell?: string[];
  featureFlags?: Array<"featured" | "trending" | "new" | "partner">;
  limit?: number;
  page?: number;
};

type ToolCategoryJoinRow = { tool_id: string; category_id: string };
type ToolTagJoinRow = { tool_id: string; tag_id: string };

type InlineToolRow = ToolRecord & {
  logo?: string | null;
  thumbnail?: string | null;
  categories?: string[] | null;
  tags?: string[] | null;
};

async function attachRelations(tools: InlineToolRow[]): Promise<ToolWithRelations[]> {
  if (!tools.length) return [];

  const supabase = createSupabasePublicClient();
  const toolIds = tools.map((tool) => tool.id);

  const [{ data: toolCategories }, { data: toolTags }] = await Promise.all([
    supabase.from("tool_categories").select("tool_id, category_id").in("tool_id", toolIds),
    supabase.from("tool_tags").select("tool_id, tag_id").in("tool_id", toolIds),
  ]);

  const categoryIds = Array.from(
    new Set(((toolCategories ?? []) as ToolCategoryJoinRow[]).map((row) => row.category_id)),
  );
  const tagIds = Array.from(new Set(((toolTags ?? []) as ToolTagJoinRow[]).map((row) => row.tag_id)));

  const [{ data: categories }, { data: tags }] = await Promise.all([
    categoryIds.length ? supabase.from("categories").select("*").in("id", categoryIds) : Promise.resolve({ data: [] }),
    tagIds.length ? supabase.from("tags").select("*").in("id", tagIds) : Promise.resolve({ data: [] }),
  ]);

  const categoryById = new Map(((categories ?? []) as CategoryRecord[]).map((category) => [category.id, category]));
  const tagById = new Map(((tags ?? []) as TagRecord[]).map((tag) => [tag.id, tag]));

  const categoryIdsByToolId = new Map<string, string[]>();
  for (const row of (toolCategories ?? []) as ToolCategoryJoinRow[]) {
    const list = categoryIdsByToolId.get(row.tool_id) ?? [];
    list.push(row.category_id);
    categoryIdsByToolId.set(row.tool_id, list);
  }

  const tagIdsByToolId = new Map<string, string[]>();
  for (const row of (toolTags ?? []) as ToolTagJoinRow[]) {
    const list = tagIdsByToolId.get(row.tool_id) ?? [];
    list.push(row.tag_id);
    tagIdsByToolId.set(row.tool_id, list);
  }

  return tools.map((tool) => {
    const { categories: inlineCategories, tags: inlineTags, ...rest } = tool;
    const inlineCategoryNames = ensureStringArray(inlineCategories);
    const inlineTagNames = ensureStringArray(inlineTags);

    const relationCategories = (categoryIdsByToolId.get(tool.id) ?? [])
      .map((id) => categoryById.get(id))
      .filter((category): category is CategoryRecord => Boolean(category));
    const relationTags = (tagIdsByToolId.get(tool.id) ?? [])
      .map((id) => tagById.get(id))
      .filter((tag): tag is TagRecord => Boolean(tag));

    const mergedCategories = mergeCategories(relationCategories, inlineCategoryNames);
    const mergedTags = mergeTags(relationTags, inlineTagNames);

    return {
      ...rest,
      categories: mergedCategories,
      tags: mergedTags,
    };
  });
}

function normalizePreismodell(preismodell: unknown) {
  if (!preismodell) return [];
  if (Array.isArray(preismodell)) return preismodell.map((item) => String(item).trim()).filter(Boolean);
  if (typeof preismodell !== "string") return [];
  return preismodell
    .split(/[,;/|]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function filterTools(tools: ToolWithRelations[], filters?: ToolFilters) {
  if (!filters) return tools;

  const { search, categories, tags, preismodell, featureFlags } = filters;

  let filtered = [...tools];

  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (tool) =>
        tool.name.toLowerCase().includes(term) ||
        tool.kurzbeschreibung?.toLowerCase().includes(term) ||
        tool.beschreibung?.toLowerCase().includes(term),
    );
  }

  if (categories?.length) {
    filtered = filtered.filter((tool) =>
      tool.categories?.some((cat) => categories.includes(cat.slug)),
    );
  }

  if (tags?.length) {
    filtered = filtered.filter((tool) =>
      tool.tags?.some((tag) => tags.includes(tag.slug)),
    );
  }

  if (preismodell?.length) {
    filtered = filtered.filter((tool) =>
      preismodell.some((price) =>
        normalizePreismodell(tool.preismodell).some((model) =>
          model.toLowerCase().includes(price.toLowerCase()),
        ),
      ),
    );
  }

  if (featureFlags?.length) {
    filtered = filtered.filter((tool) => {
      return featureFlags.every((flag) => {
        switch (flag) {
          case "featured":
            return Boolean(tool.is_featured);
          case "trending":
            return Boolean(tool.is_trending);
          case "new":
            return Boolean(tool.is_new);
          case "partner":
            return Boolean(tool.partner_offer);
          default:
            return true;
        }
      });
    });
  }

  return filtered;
}

export async function getTools(filters?: ToolFilters) {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("tools")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fehler beim Laden der Tools", error);
      return [];
    }

    const hydrated = await attachRelations((data ?? []) as InlineToolRow[]);
    const mapped = hydrated;
    const filtered = filterTools(mapped, filters);

    if (!filters?.limit) return filtered;

    const page = filters.page ?? 1;
    const start = (page - 1) * filters.limit;
    return filtered.slice(start, start + filters.limit);
  } catch (error) {
    console.error("Fehler beim Laden der Tools", error);
    return [];
  }
}

export async function getToolCount(filters?: ToolFilters) {
  const { limit, page, ...rest } = filters ?? {};
  void limit;
  void page;
  const hasActiveFilters = Object.entries(rest).some(([, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== "";
  });

  if (!hasActiveFilters) {
    try {
      const supabase = createSupabasePublicClient();
      const { count, error } = await supabase.from("tools").select("*", { count: "exact", head: true });
      if (error) {
        console.error("Tool Count konnte nicht geladen werden", error);
        return 0;
      }
      return count ?? 0;
    } catch (error) {
      console.error("Tool Count konnte nicht geladen werden", error);
      return 0;
    }
  }

  const filteredTools = await getTools(rest as ToolFilters);
  return filteredTools.length;
}

export async function getToolBySlug(slug: string) {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("tools")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      if ((error as { code?: string }).code === "PGRST116") return null;
      console.error("Tool konnte nicht geladen werden", error);
      return null;
    }

    const [hydrated] = await attachRelations([data as ToolRecord]);
    return hydrated ?? null;
  } catch (error) {
    console.error("Tool konnte nicht geladen werden", error);
    return null;
  }
}

export async function getFeaturedTools() {
  return getTools({ featureFlags: ["featured"], limit: 6 });
}

export async function getNewestTools(limit = 8) {
  return getTools({ limit, page: 1 });
}

export async function getFilters() {
  try {
    const supabase = createSupabasePublicClient();

    const [{ data: categories }, { data: tags }] = await Promise.all([
      supabase.from("categories").select("*").order("name", { ascending: true }),
      supabase
        .from("tags")
        .select("*")
        .in("scope", ["tool", "both"])
        .order("name", { ascending: true }),
    ]);

    return {
      categories: categories ?? [],
      tags: tags ?? [],
    };
  } catch (error) {
    console.error("Filter konnten nicht geladen werden", error);
    return { categories: [], tags: [] };
  }
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

function mergeCategories(existing: CategoryRecord[], inlineNames: string[]) {
  const map = new Map<string, CategoryRecord>();
  for (const category of existing) {
    map.set(category.slug, category);
  }
  for (const name of inlineNames) {
    const slug = slugify(name);
    if (!slug) continue;
    if (!map.has(slug)) {
      map.set(slug, {
        id: `inline-${slug}`,
        name,
        slug,
        description: null,
      });
    }
  }
  return Array.from(map.values());
}

function mergeTags(existing: TagRecord[], inlineNames: string[]) {
  const map = new Map<string, TagRecord>();
  for (const tag of existing) {
    map.set(tag.slug, tag);
  }
  for (const name of inlineNames) {
    const slug = slugify(name);
    if (!slug) continue;
    if (!map.has(slug)) {
      map.set(slug, {
        id: `inline-${slug}`,
        name,
        slug,
        scope: "tool",
      });
    }
  }
  return Array.from(map.values());
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
