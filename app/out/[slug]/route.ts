import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const supabase = await createSupabaseServerClient();

  const { data: tool } = await supabase
    .from("tools")
    .select("id, affiliate_url, slug")
    .eq("slug", slug)
    .single();

  if (!tool?.affiliate_url) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const referrer = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent");

  await supabase.from("click_events").insert({
    tool_id: tool.id,
    user_id: user?.id ?? null,
    referrer,
    user_agent: userAgent,
  });

  // Ensure absolute URL
  const target = tool.affiliate_url.startsWith("http")
    ? tool.affiliate_url
    : `https://${tool.affiliate_url}`;

  return NextResponse.redirect(target, { status: 302 });
}
