import { FadeIn } from "@/components/motion/fade-in";
import { Separator } from "@/components/ui/separator";
import { HomeHero } from "@/components/home/hero";
import { ToolExplorer } from "@/components/tools/tool-explorer";
import { getFilters, getToolCount, getTools } from "@/lib/data/tools";
import { getToolVoteCounts } from "@/lib/data/tool-votes";

export default async function Home() {
  const [filters, tools, totalTools] = await Promise.all([
    getFilters(),
    getTools({ limit: 60 }),
    getToolCount(),
  ]);
  const voteCounts = await getToolVoteCounts(tools.map((tool) => tool.id));

  return (
    <div className="space-y-12 lg:space-y-16">
      <HomeHero toolCount={totalTools} />

      <section id="tool-explorer">
        <FadeIn>
          {!tools.length ? (
            <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
              Tools konnten gerade nicht geladen werden. Pruefe deine Supabase Verbindung (
              <code>NEXT_PUBLIC_SUPABASE_URL</code> / <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>) oder ob dein Supabase
              Projekt erreichbar ist.
            </div>
          ) : null}
          <ToolExplorer
            tools={tools}
            categories={filters.categories}
            tags={filters.tags}
            voteCounts={voteCounts}
            initialLimit={30}
          />
        </FadeIn>
      </section>

      <Separator className="bg-white/5" />
    </div>
  );
}
