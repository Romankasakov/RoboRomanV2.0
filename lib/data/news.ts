import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { NewsRecord, NewsWithTags, TagRecord } from "@/types/entities";

type NewsTagJoinRow = { news_id: string; tag_id: string };

async function attachTags(news: NewsRecord[]): Promise<NewsWithTags[]> {
  if (!news.length) return [];

  const supabase = createSupabasePublicClient();
  const newsIds = news.map((item) => item.id);

  const { data: newsTags } = await supabase
    .from("news_tags")
    .select("news_id, tag_id")
    .in("news_id", newsIds);

  const tagIds = Array.from(new Set(((newsTags ?? []) as NewsTagJoinRow[]).map((row) => row.tag_id)));

  const { data: tags } = tagIds.length ? await supabase.from("tags").select("*").in("id", tagIds) : { data: [] };

  const tagById = new Map(((tags ?? []) as TagRecord[]).map((tag) => [tag.id, tag]));

  const tagIdsByNewsId = new Map<string, string[]>();
  for (const row of (newsTags ?? []) as NewsTagJoinRow[]) {
    const list = tagIdsByNewsId.get(row.news_id) ?? [];
    list.push(row.tag_id);
    tagIdsByNewsId.set(row.news_id, list);
  }

  return news.map((item) => ({
    ...item,
    tags: (tagIdsByNewsId.get(item.id) ?? [])
      .map((id) => tagById.get(id))
      .filter((tag): tag is TagRecord => Boolean(tag)),
  }));
}

export async function getNewsList({
  tags,
  limit,
}: {
  tags?: string[];
  limit?: number;
} = {}) {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(limit ?? 50);

    if (error) {
      console.error("News konnten nicht geladen werden", error);
      return [];
    }

    let list = await attachTags((data ?? []) as NewsRecord[]);

    if (tags?.length) {
      list = list.filter((item) => item.tags?.some((tag) => tags.includes(tag.slug)));
    }

    return list;
  } catch (error) {
    console.error("News konnten nicht geladen werden", error);
    return [];
  }
}

export async function getNewsBySlug(slug: string) {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      if ((error as { code?: string }).code === "PGRST116") return null;
      console.error("News konnte nicht geladen werden", error);
      return null;
    }

    const [hydrated] = await attachTags([data as NewsRecord]);
    return hydrated ?? null;
  } catch (error) {
    console.error("News konnte nicht geladen werden", error);
    return null;
  }
}

export async function getNewsTags() {
  try {
    const supabase = createSupabasePublicClient();
    const { data } = await supabase
      .from("tags")
      .select("*")
      .eq("scope", "news")
      .order("name", { ascending: true });
    return data ?? [];
  } catch (error) {
    console.error("News-Tags konnten nicht geladen werden", error);
    return [];
  }
}
