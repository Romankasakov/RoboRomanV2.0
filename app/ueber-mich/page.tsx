import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Ueber mich | RoboRoman",
  description: "Hintergrund zu RoboRoman und warum dieses Verzeichnis entstanden ist.",
};

export default function AboutPage() {
  return (
    <div className="space-y-10 lg:space-y-14">
      <FadeIn className="space-y-3">
        <Badge variant="secondary" className="border border-primary/30 bg-primary/10 text-primary">
          RoboRoman
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">Ueber mich</h1>
        <p className="text-muted-foreground">
          RoboRoman ist ein kuratiertes Verzeichnis fuer KI-Tools im DACH-Raum mit Fokus auf Datenschutz
          und klare Bewertungen. Desktop-first gestaltet.
        </p>
      </FadeIn>

      <Card className="border-white/5 bg-black/40">
        <CardHeader>
          <CardTitle>Mission</CardTitle>
          <CardDescription>Transparente KI-Nutzung fuer Teams in Deutschland, Oesterreich, Schweiz.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Viele KI-Verzeichnisse ignorieren Datenschutz. RoboRoman legt Wert auf AVV, Hosting-Region und
            Subprocessor-Transparenz. Jede Tool-Detailseite enthaelt eine DSGVO-Sektion und den Hinweis
            „Keine Rechtsberatung“.
          </p>
          <Separator className="bg-white/5" />
          <p>
            Geplant sind weitere Community-Features wie verifizierte Bewertungen, Admin-Panel fuer
            kuratierten Content und automatisierte Checks der Datenschutzerklaerungen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
