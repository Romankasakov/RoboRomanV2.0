import { createTool } from "@/app/actions/admin";
import { FieldSection, TextField, TextareaField, ToggleField } from "@/components/admin/form-fields";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Tool-Management | RoboRoman",
};

export default async function AdminToolsPage() {
  const supabase = await createSupabaseServerClient();
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from("categories").select("*").order("name", { ascending: true }),
    supabase.from("tags").select("*").order("name", { ascending: true }),
  ]);

  const categoryList = categories ?? [];
  const tagList = tags ?? [];
  const toolTags = tagList.filter((tag) => tag.scope === "tool" || tag.scope === "both");

  return (
    <FadeIn className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Neues Tool anlegen</h2>
        <p className="text-sm text-muted-foreground">
          Alle Felder spiegeln die Inhalte wider, die auf der Tool-Detailseite und in der Tool-Card gezeigt werden.
        </p>
      </div>

      <form action={createTool} className="space-y-8">
        <FieldSection title="Stammdaten" description="Slug, Name und Messaging.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Slug" name="slug" placeholder="midjourney" required />
            <TextField label="Name" name="name" placeholder="Midjourney" required />
            <TextField label="Kurzbeschreibung" name="kurzbeschreibung" placeholder="Ein Satz Elevator Pitch" />
            <TextField label="Zusammenfassung" name="zusammenfassung" placeholder="Kurzer Teaser für Cards" />
          </div>
          <TextareaField
            label="Beschreibung"
            name="beschreibung"
            rows={5}
            placeholder="Ausführliche Beschreibung"
            description="Dieser Text wird in der Detailansicht angezeigt."
          />
        </FieldSection>

        <FieldSection title="Positionierung & Konversion" description="Pricing, CTA, Use Cases und Plattformen.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Preismodell" name="preismodell" placeholder="Freemium, Enterprise..." />
            <TextField label="Use Case" name="use_case" placeholder="Content, Research, Ops..." />
            <TextField label="Plattform" name="plattform" placeholder="Web, iOS, Desktop" />
            <TextField label="Affiliate URL" name="affiliate_url" placeholder="https://..." />
            <TextField label="CTA Label" name="cta_label" placeholder="Direkt besuchen" />
            <TextField
              label="Feature Flags"
              name="feature_flags"
              placeholder="featured, trending"
              description="Kommagetrennte Liste für spezielle Badges."
            />
          </div>
        </FieldSection>

        <FieldSection title="Medien" description="Visuals für Card und Detailseite.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Logo URL" name="logo_url" placeholder="https://..." required />
            <TextField label="Thumbnail URL" name="thumbnail_url" placeholder="https://..." required />
          </div>
        </FieldSection>

        <FieldSection title="Bewertungen & Social Proof" description="Ratings und Live-Daten.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Community Rating (0-5)" name="community_rating" type="number" step="0.1" />
            <TextField label="DSGVO-Score (0-10)" name="gdpr_score" type="number" step="0.1" />
            <TextField label="Redaktionsbewertung (0-5)" name="rating_overall" type="number" step="0.1" />
            <TextField label="Redaktions-GDPR (0-10)" name="rating_gdpr" type="number" step="0.1" />
            <TextField label="Letzter Check" name="last_checked_at" type="datetime-local" />
          </div>
          <TextareaField
            label="Social Proof JSON"
            name="social_proof"
            placeholder='{"users": 420000}'
            description="JSON oder Key:Value pro Zeile (z. B. custom: 1200 Teams)."
          />
        </FieldSection>

        <FieldSection title="DSGVO & Compliance" description="Alle Angaben für Analyse & Kurzcheck.">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-semibold text-foreground">AVV / DPA</span>
              <select
                name="avv_dpa"
                className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-foreground"
                defaultValue="unknown"
              >
                <option value="yes">Ja</option>
                <option value="no">Nein</option>
                <option value="unknown">Unklar</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-semibold text-foreground">Hosting Region</span>
              <select
                name="hosting_region"
                className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-foreground"
                defaultValue="unknown"
              >
                <option value="eu">EU</option>
                <option value="usa">USA</option>
                <option value="unknown">Unklar</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-semibold text-foreground">Subprocessors</span>
              <select
                name="subprocessors"
                className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-foreground"
                defaultValue="unknown"
              >
                <option value="yes">Ja</option>
                <option value="no">Nein</option>
                <option value="unknown">Unklar</option>
              </select>
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-semibold text-foreground">Risiko</span>
              <select
                name="risk_level"
                className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-foreground"
                defaultValue="medium"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <TextareaField label="AVV Details" name="avv_dpa_details" rows={3} />
            <TextareaField label="Hosting Region Details" name="hosting_region_details" rows={3} />
            <TextareaField label="Risiko Details" name="risk_level_details" rows={3} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextareaField
              label="AVV Status Liste"
              name="avv_dpa_statuses"
              rows={3}
              description="Komma- oder Zeilengetrennte Werte (z. B. Ja, Teilweise, Optional)."
            />
            <TextareaField
              label="Hosting Regionen Liste"
              name="hosting_regions"
              rows={3}
              description="Mehrere Regionen, getrennt durch Kommas oder Zeilen."
            />
          </div>
        </FieldSection>

        <FieldSection title="Daten & Sicherheit" description="JSON Felder für Data Types und Security Measures.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextareaField
              label="Data Types JSON"
              name="data_types"
              rows={5}
              description="JSON oder Key:Value pro Zeile."
            />
            <TextareaField
              label="Security Measures JSON"
              name="security_measures"
              rows={5}
              description="JSON oder Key:Value pro Zeile."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Data Notes" name="data_type_notes" placeholder="Hinweise" />
            <TextField label="Security Notes" name="security_notes" placeholder="Hinweise" />
          </div>
        </FieldSection>

        <FieldSection title="Quelle & Nachweise" description="URLs für Privacy Policy, AVV und Security.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Privacy Policy URL" name="sources_privacy" placeholder="https://..." />
            <TextField label="DPA / AVV URL" name="sources_dpa" placeholder="https://..." />
            <TextField label="Security URL" name="sources_security" placeholder="https://..." />
            <TextField label="Custom Source Label" name="sources_custom_label" placeholder="z. B. Whitepaper" />
            <TextField label="Custom Source URL" name="sources_custom_url" placeholder="https://..." />
          </div>
        </FieldSection>

        <FieldSection title="Feature Flags" description="Visuelle Hervorhebungen auf Cards.">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <ToggleField label="Featured" name="is_featured" description="Tool wird auf der Startseite gefeatured." />
            <ToggleField label="Trending" name="is_trending" description="Kennzeichnet Trendstatus." />
            <ToggleField label="Neu" name="is_new" description="Markiert neue Tools." />
            <ToggleField label="Partner" name="partner_offer" description="Partner-Angebot Badge." />
            <ToggleField label="Empfohlen" name="is_recommended" description="Redaktionelle Empfehlung." />
          </div>
        </FieldSection>

        <FieldSection title="Kategorien & Tags" description="Mehrfachauswahl.">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">Kategorien</Label>
              <div className="grid gap-2">
                {categoryList.map((category) => (
                  <label key={category.id} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" name="categories" value={category.id} className="h-4 w-4 rounded border-white/20" />
                    {category.name}
                  </label>
                ))}
                {!categoryList.length && <p className="text-sm text-muted-foreground">Keine Kategorien vorhanden.</p>}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-foreground">Tags</Label>
              <div className="grid gap-2">
                {toolTags.map((tag) => (
                  <label key={tag.id} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" name="toolTags" value={tag.id} className="h-4 w-4 rounded border-white/20" />
                    {tag.name}
                  </label>
                ))}
                {!toolTags.length && <p className="text-sm text-muted-foreground">Keine Tags vorhanden.</p>}
              </div>
            </div>
          </div>
        </FieldSection>

        <Separator className="bg-white/5" />
        <div className="flex justify-end">
          <Button type="submit" size="lg" className="gap-2">
            Tool speichern
            <span aria-hidden>↗</span>
          </Button>
        </div>
      </form>
    </FadeIn>
  );
}
