import { FadeIn } from "@/components/motion/fade-in";
import { Separator } from "@/components/ui/separator";
import { ToolExplorer } from "@/components/tools/tool-explorer";
import { getFilters, getTools, getToolCount } from "@/lib/data/tools";
import { getToolVoteCounts } from "@/lib/data/tool-votes";

export const metadata = {
  title: "Neue Tools | RoboRoman",
  description: "Die neuesten KI-Tools im DACH-Raum, täglich aktualisiert.",
};

export default async function NeueToolsPage() {
  const [tools, filters, total] = await Promise.all([
    getTools({ limit: 90 }),
    getFilters(),
    getToolCount(),
  ]);
  const voteCounts = await getToolVoteCounts(tools.map((tool) => tool.id));

  return (
    <div className="space-y-8 lg:space-y-12">
      <FadeIn className="space-y-3">
        <p className="text-sm text-primary">Neu hinzugefügt</p>
        <h1 className="text-3xl font-semibold text-foreground">Neue KI-Tools</h1>
        <p className="text-muted-foreground">
          Zeigt die neuesten Einträge zuerst. Insgesamt {total} Tools aktuell verfügbar.
        </p>
      </FadeIn>

      <Separator className="bg-white/5" />

      <ToolExplorer
        tools={tools}
        categories={filters.categories}
        tags={filters.tags}
        voteCounts={voteCounts}
        initialLimit={60}
      />
    </div>
  );
}
