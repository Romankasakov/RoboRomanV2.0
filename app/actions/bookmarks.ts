"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function toggleBookmark(
  toolId: string,
  toolSlug?: string,
  revalidateTarget = "/mein-tool-stack",
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("auth-required");
  }

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("tool_id", toolId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from("bookmarks").delete().eq("id", existing.id);
  } else {
    await supabase.from("bookmarks").insert({ tool_id: toolId, user_id: user.id });
  }

  revalidatePath(revalidateTarget);
  if (toolSlug) {
    revalidatePath(`/tools/${toolSlug}`);
  }
  return { ok: true };
}

export async function updateBookmarkNote(id: string, note: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("auth-required");

  await supabase
    .from("bookmarks")
    .update({ notes: note })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/mein-tool-stack");
  return { ok: true };
}
