import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BookmarkRecord, BookmarkWithTool, CategoryRecord, TagRecord, ToolRecord, ToolWithRelations } from "@/types/entities";

type ToolCategoryJoinRow = { tool_id: string; category_id: string };
type ToolTagJoinRow = { tool_id: string; tag_id: string };

async function attachRelations(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  tools: ToolRecord[],
): Promise<ToolWithRelations[]> {
  if (!tools.length) return [];

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

  return tools.map((tool) => ({
    ...tool,
    categories: (categoryIdsByToolId.get(tool.id) ?? [])
      .map((id) => categoryById.get(id))
      .filter((category): category is CategoryRecord => Boolean(category)),
    tags: (tagIdsByToolId.get(tool.id) ?? [])
      .map((id) => tagById.get(id))
      .filter((tag): tag is TagRecord => Boolean(tag)),
  }));
}

export async function getBookmarksForUser(userId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Bookmarks konnten nicht geladen werden", error);
      return [];
    }

    const bookmarks = (data ?? []) as BookmarkRecord[];
    const toolIds = Array.from(new Set(bookmarks.map((bookmark) => bookmark.tool_id)));

    const { data: toolRows, error: toolError } = await supabase.from("tools").select("*").in("id", toolIds);
    if (toolError) {
      console.error("Tools fuer Bookmarks konnten nicht geladen werden", toolError);
      return bookmarks.map((bookmark) => ({ ...bookmark })) as BookmarkWithTool[];
    }

    const tools = await attachRelations(supabase, (toolRows ?? []) as ToolRecord[]);
    const toolById = new Map(tools.map((tool) => [tool.id, tool]));

    return bookmarks.map((bookmark) => ({
      ...bookmark,
      tool: toolById.get(bookmark.tool_id),
    })) as BookmarkWithTool[];
  } catch (error) {
    console.error("Bookmarks konnten nicht geladen werden", error);
    return [];
  }
}
