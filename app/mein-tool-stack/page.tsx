import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ToolCard } from "@/components/tools/tool-card";
import { getBookmarksForUser } from "@/lib/data/bookmarks";
import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Mein Tool Stack | RoboRoman",
  description: "Gespeicherte Tools fuer angemeldete Mitglieder.",
};

export default async function MeinToolStackPage() {
  const user = await requireUser();
  const bookmarks = await getBookmarksForUser(user.id);

  return (
    <div className="space-y-8 lg:space-y-12">
      <FadeIn className="space-y-3">
        <Badge variant="secondary" className="border border-primary/30 bg-primary/10 text-primary">
          Mitgliederbereich
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">Mein Tool Stack</h1>
        <p className="text-muted-foreground">
          Deine gespeicherten Tools. Bookmarks sind privat. Du kannst sie jederzeit entfernen.
        </p>
      </FadeIn>

      <Separator className="bg-white/5" />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {bookmarks.map((bookmark) =>
          bookmark.tool ? (
            <ToolCard
              key={bookmark.id}
              tool={bookmark.tool}
              showBookmark
              initialBookmarked
            />
          ) : null,
        )}
        {!bookmarks.length && (
          <div className="rounded-xl border border-white/5 bg-black/30 p-6 text-muted-foreground">
            Noch keine Tools gespeichert.
          </div>
        )}
      </div>
    </div>
  );
}
