"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database.types";

const toolSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  kurzbeschreibung: z.string().optional(),
  beschreibung: z.string().optional(),
  zusammenfassung: z.string().optional(),
  preismodell: z.string().optional(),
  affiliate_url: z.string().url().optional(),
  logo_url: z.string().url(),
  thumbnail_url: z.string().url(),
  use_case: z.string().optional(),
  plattform: z.string().optional(),
  avv_dpa: z.enum(["yes", "no", "unknown"]).optional(),
  avv_dpa_details: z.string().optional(),
  hosting_region: z.enum(["eu", "usa", "unknown"]).optional(),
  hosting_region_details: z.string().optional(),
  subprocessors: z.enum(["yes", "no", "unknown"]).optional(),
  risk_level: z.enum(["low", "medium", "high"]).optional(),
  risk_level_details: z.string().optional(),
  gdpr_score: z.string().optional(),
  rating_overall: z.string().optional(),
  rating_gdpr: z.string().optional(),
  community_rating: z.string().optional(),
  last_checked_at: z.string().optional(),
  data_types: z.string().optional(),
  data_type_notes: z.string().optional(),
  security_measures: z.string().optional(),
  security_notes: z.string().optional(),
  avv_dpa_statuses: z.string().optional(),
  hosting_regions: z.string().optional(),
  feature_flags: z.string().optional(),
  cta_label: z.string().optional(),
  social_proof: z.string().optional(),
  sources_privacy: z.string().url().optional(),
  sources_dpa: z.string().url().optional(),
  sources_security: z.string().url().optional(),
  sources_custom_label: z.string().optional(),
  sources_custom_url: z.string().url().optional(),
});

const newsSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  imageUrl: z.string().url().optional(),
  publishedAt: z.string().optional(),
  sourceUrl: z.string().url(),
});

type NewsInsert = Database["public"]["Tables"]["news"]["Insert"];

function cleanString(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

function getRawField(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalField(formData: FormData, field: string) {
  const value = getRawField(formData, field);
  return value.length ? value : undefined;
}

function parseNumber(value?: string | null) {
  if (!value) return null;
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value?: string | null) {
  const trimmed = cleanString(value);
  if (!trimmed) return null;
  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseBoolean(value?: FormDataEntryValue | null) {
  if (typeof value !== "string") return false;
  const normalized = value.toLowerCase();
  return ["true", "on", "1", "yes"].includes(normalized);
}

function parseJsonField(value?: string | null): Json | null {
  const text = cleanString(value);
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "object" || Array.isArray(parsed)) return parsed as Json;
  } catch {
    // fall through to fallback below
  }
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return null;
  if (lines.length === 1) {
    const [line] = lines;
    if (line.includes(":")) {
      const [key, ...rest] = line.split(":");
      return { [key.trim()]: rest.join(":").trim() };
    }
    return { value: line };
  }
  const record: Record<string, string> = {};
  for (const line of lines) {
    if (line.includes(":")) {
      const [key, ...rest] = line.split(":");
      record[key.trim()] = rest.join(":").trim();
    } else {
      record[`entry_${Object.keys(record).length + 1}`] = line;
    }
  }
  return record;
}

function parseArrayField(value?: string | null) {
  const text = cleanString(value);
  if (!text) return [];
  return text
    .split(/[\n,;|]/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function buildSources(parsed: z.infer<typeof toolSchema>): Json | null {
  const sources: Record<string, string> = {};
  if (parsed.sources_privacy) sources.privacy_policy = parsed.sources_privacy.trim();
  if (parsed.sources_dpa) sources.dpa = parsed.sources_dpa.trim();
  if (parsed.sources_security) sources.security = parsed.sources_security.trim();
  if (parsed.sources_custom_label && parsed.sources_custom_url) {
    sources[parsed.sources_custom_label.trim().toLowerCase().replace(/\s+/g, "_")] = parsed.sources_custom_url.trim();
  }
  return Object.keys(sources).length ? sources : null;
}

export async function createTool(formData: FormData) {
  const parsed = toolSchema.parse({
    slug: getRawField(formData, "slug"),
    name: getRawField(formData, "name"),
    kurzbeschreibung: getOptionalField(formData, "kurzbeschreibung"),
    beschreibung: getOptionalField(formData, "beschreibung"),
    zusammenfassung: getOptionalField(formData, "zusammenfassung"),
    preismodell: getOptionalField(formData, "preismodell"),
    affiliate_url: getOptionalField(formData, "affiliate_url"),
    logo_url: getRawField(formData, "logo_url"),
    thumbnail_url: getRawField(formData, "thumbnail_url"),
    use_case: getOptionalField(formData, "use_case"),
    plattform: getOptionalField(formData, "plattform"),
    avv_dpa: getOptionalField(formData, "avv_dpa"),
    avv_dpa_details: getOptionalField(formData, "avv_dpa_details"),
    hosting_region: getOptionalField(formData, "hosting_region"),
    hosting_region_details: getOptionalField(formData, "hosting_region_details"),
    subprocessors: getOptionalField(formData, "subprocessors"),
    risk_level: getOptionalField(formData, "risk_level"),
    risk_level_details: getOptionalField(formData, "risk_level_details"),
    gdpr_score: getOptionalField(formData, "gdpr_score"),
    rating_overall: getOptionalField(formData, "rating_overall"),
    rating_gdpr: getOptionalField(formData, "rating_gdpr"),
    community_rating: getOptionalField(formData, "community_rating"),
    last_checked_at: getOptionalField(formData, "last_checked_at"),
    data_types: getOptionalField(formData, "data_types"),
    data_type_notes: getOptionalField(formData, "data_type_notes"),
    security_measures: getOptionalField(formData, "security_measures"),
    security_notes: getOptionalField(formData, "security_notes"),
    avv_dpa_statuses: getOptionalField(formData, "avv_dpa_statuses"),
    hosting_regions: getOptionalField(formData, "hosting_regions"),
    feature_flags: getOptionalField(formData, "feature_flags"),
    cta_label: getOptionalField(formData, "cta_label"),
    social_proof: getOptionalField(formData, "social_proof"),
    sources_privacy: getOptionalField(formData, "sources_privacy"),
    sources_dpa: getOptionalField(formData, "sources_dpa"),
    sources_security: getOptionalField(formData, "sources_security"),
    sources_custom_label: getOptionalField(formData, "sources_custom_label"),
    sources_custom_url: getOptionalField(formData, "sources_custom_url"),
  });

  const selectedCategories = formData.getAll("categories").map((entry) => entry.toString()).filter(Boolean);
  const selectedTags = formData.getAll("toolTags").map((entry) => entry.toString()).filter(Boolean);
  const featuredFlag = parseBoolean(formData.get("is_featured"));
  const trendingFlag = parseBoolean(formData.get("is_trending"));
  const newFlag = parseBoolean(formData.get("is_new"));
  const partnerFlag = parseBoolean(formData.get("partner_offer"));
  const recommendedFlag = parseBoolean(formData.get("is_recommended"));

  const supabase = await createSupabaseServerClient();
  const avvStatuses = parseArrayField(parsed.avv_dpa_statuses);
  const hostingRegions = parseArrayField(parsed.hosting_regions);
  const featureFlags = parseArrayField(parsed.feature_flags);

  const payload = {
    slug: parsed.slug.trim(),
    name: parsed.name.trim(),
    kurzbeschreibung: parsed.kurzbeschreibung?.trim() || null,
    beschreibung: parsed.beschreibung?.trim() || null,
    zusammenfassung: parsed.zusammenfassung?.trim() || null,
    preismodell: parsed.preismodell?.trim() || null,
    affiliate_url: parsed.affiliate_url?.trim() || null,
    logo_url: parsed.logo_url.trim(),
    thumbnail_url: parsed.thumbnail_url.trim(),
    use_case: parsed.use_case?.trim() || null,
    plattform: parsed.plattform?.trim() || null,
    avv_dpa: parsed.avv_dpa ?? "unknown",
    avv_dpa_details: parsed.avv_dpa_details?.trim() || null,
    avv_dpa_statuses: avvStatuses.length ? avvStatuses : undefined,
    hosting_region: parsed.hosting_region ?? "unknown",
    hosting_region_details: parsed.hosting_region_details?.trim() || null,
    hosting_regions: hostingRegions.length ? hostingRegions : undefined,
    subprocessors: parsed.subprocessors ?? "unknown",
    risk_level: parsed.risk_level ?? "medium",
    risk_level_details: parsed.risk_level_details?.trim() || null,
    gdpr_score: parseNumber(parsed.gdpr_score),
    rating_overall: parseNumber(parsed.rating_overall),
    rating_gdpr: parseNumber(parsed.rating_gdpr),
    community_rating: parseNumber(parsed.community_rating),
    last_checked_at: parseDate(parsed.last_checked_at),
    data_types: parseJsonField(parsed.data_types) ?? undefined,
    data_type_notes: parsed.data_type_notes?.trim() || null,
    security_measures: parseJsonField(parsed.security_measures) ?? undefined,
    security_notes: parsed.security_notes?.trim() || null,
    feature_flags: featureFlags.length ? featureFlags : undefined,
    cta_label: parsed.cta_label?.trim() || undefined,
    social_proof: parseJsonField(parsed.social_proof) ?? undefined,
    sources: buildSources(parsed) ?? undefined,
    is_featured: featuredFlag,
    is_trending: trendingFlag,
    is_new: newFlag,
    partner_offer: partnerFlag,
    is_recommended: recommendedFlag,
  } satisfies Database["public"]["Tables"]["tools"]["Insert"];

  const { data: insertedTool, error } = await supabase
    .from("tools")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw new Error(`Tool konnte nicht erstellt werden: ${error.message}`);

  if (insertedTool?.id) {
    if (selectedCategories.length) {
      await supabase.from("tool_categories").insert(
        selectedCategories.map((categoryId) => ({
          tool_id: insertedTool.id,
          category_id: categoryId,
        })),
      );
    }
    if (selectedTags.length) {
      await supabase.from("tool_tags").insert(
        selectedTags.map((tagId) => ({
          tool_id: insertedTool.id,
          tag_id: tagId,
        })),
      );
    }
  }

  revalidatePath("/");
  revalidatePath("/neue-tools");
  revalidatePath("/admin");
  revalidatePath("/admin/tools");
}

export async function createNews(formData: FormData) {
  const parsed = newsSchema.parse({
    slug: formData.get("newsSlug"),
    title: formData.get("newsTitle"),
    excerpt: formData.get("newsExcerpt"),
    content: formData.get("newsContent"),
    imageUrl: formData.get("newsImageUrl"),
    publishedAt: formData.get("newsDate"),
    sourceUrl: formData.get("newsSource"),
  });

  const newsTagIds = formData.getAll("newsTags").map((entry) => entry.toString()).filter(Boolean);

  const supabase = await createSupabaseServerClient();
  const { data: insertedNews, error } = await supabase
    .from("news")
    .insert({
      slug: parsed.slug.trim(),
      title: parsed.title.trim(),
      excerpt: parsed.excerpt?.trim() || null,
      content: (parsed.content || parsed.excerpt || "").trim(),
      image_url: parsed.imageUrl?.trim() || null,
      published_at: parseDate(parsed.publishedAt) ?? new Date().toISOString(),
      sources: { primary: parsed.sourceUrl.trim() },
    } satisfies NewsInsert)
    .select("id")
    .single();

  if (error) throw new Error(`News konnten nicht erstellt werden: ${error.message}`);

  if (insertedNews?.id && newsTagIds.length) {
    await supabase.from("news_tags").insert(
      newsTagIds.map((tagId) => ({
        news_id: insertedNews.id,
        tag_id: tagId,
      })),
    );
  }

  revalidatePath("/news");
  revalidatePath("/admin");
  revalidatePath("/admin/news");
}
