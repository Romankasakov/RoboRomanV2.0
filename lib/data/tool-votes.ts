import { createSupabasePublicClient } from "@/lib/supabase/public";

type VoteCounts = { up: number; down: number };

type ToolVoteRow = Record<string, unknown>;

export async function getToolVoteCounts(toolIds: string[]): Promise<Record<string, VoteCounts>> {
  if (!toolIds.length) return {};

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase.from("tool_votes").select("*").in("tool_id", toolIds);

    if (error) {
      console.error("Tool Votes konnten nicht geladen werden", error);
      return {};
    }

    const counts: Record<string, VoteCounts> = {};

    for (const row of (data ?? []) as ToolVoteRow[]) {
      const toolId = typeof row.tool_id === "string" ? row.tool_id : null;
      if (!toolId) continue;

      const voteRaw =
        (typeof row.vote_type === "string" ? row.vote_type : null) ??
        (typeof row.vote === "string" ? row.vote : null) ??
        (typeof row.type === "string" ? row.type : null);

      if (!counts[toolId]) counts[toolId] = { up: 0, down: 0 };

      const normalized = voteRaw?.toLowerCase() ?? "";
      if (normalized === "up" || normalized === "like" || normalized === "positive") counts[toolId].up += 1;
      if (normalized === "down" || normalized === "dislike" || normalized === "negative") counts[toolId].down += 1;
    }

    return counts;
  } catch (error) {
    console.error("Tool Votes konnten nicht geladen werden", error);
    return {};
  }
}
