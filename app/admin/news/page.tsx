import { createNews } from "@/app/actions/admin";
import { FieldSection, TextField, TextareaField } from "@/components/admin/form-fields";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "News-Management | RoboRoman",
};

export default async function AdminNewsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: tags } = await supabase.from("tags").select("*").order("name", { ascending: true });
  const newsTags = (tags ?? []).filter((tag) => tag.scope === "news" || tag.scope === "both");

  return (
    <FadeIn className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">News veröffentlichen</h2>
        <p className="text-sm text-muted-foreground">Teaser, Content und Quell-Links synchronisieren sich mit der News-Seite.</p>
      </div>

      <form action={createNews} className="space-y-8">
        <FieldSection title="Metadaten" description="Slug, Titel und Veröffentlichungsdatum.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Slug" name="newsSlug" placeholder="openai-neues-model" required />
            <TextField label="Titel" name="newsTitle" placeholder="OpenAI stellt neues Modell vor" required />
            <TextField label="Publikationsdatum" name="newsDate" type="date" />
            <TextField label="Source URL" name="newsSource" placeholder="https://..." required />
            <TextField label="Thumbnail URL" name="newsImageUrl" placeholder="https://..." />
          </div>
        </FieldSection>

        <FieldSection title="Content" description="Teaser und Langform-Inhalt.">
          <TextareaField label="Zusammenfassung" name="newsExcerpt" rows={4} placeholder="Kurzbeschreibung" />
          <TextareaField
            label="Content"
            name="newsContent"
            rows={6}
            placeholder="Optionaler Volltext – ansonsten wird der Teaser genutzt."
          />
        </FieldSection>

        <FieldSection title="Tags" description="Kategorien für Filterung">
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground">News Tags</Label>
            <div className="grid gap-2 md:grid-cols-2">
              {newsTags.map((tag) => (
                <label key={tag.id} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" name="newsTags" value={tag.id} className="h-4 w-4 rounded border-white/20" />
                  {tag.name}
                </label>
              ))}
              {!newsTags.length && <p className="text-sm text-muted-foreground">Keine Tags vorhanden.</p>}
            </div>
          </div>
        </FieldSection>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="gap-2">
            News speichern
            <span aria-hidden>↗</span>
          </Button>
        </div>
      </form>
    </FadeIn>
  );
}
