import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Newsletter | RoboRoman",
  description: "Abonniere den RoboRoman Newsletter fuer KI-Tools und Nachrichten.",
};

export default function NewsletterPage() {
  return (
    <div className="space-y-10 lg:space-y-14">
      <FadeIn className="space-y-3">
        <Badge variant="secondary" className="border border-primary/30 bg-primary/10 text-primary">
          Community-Newsletter
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">Newsletter abonnieren</h1>
        <p className="text-muted-foreground">
          Einmal pro Woche die neuesten KI-Tools, DACH-News und Produkt-Updates. Kein Spam, moeglichst kurz.
        </p>
      </FadeIn>

      <Card className="border-white/5 bg-black/40">
        <CardHeader>
          <CardTitle>Bleibe auf dem Laufenden</CardTitle>
          <CardDescription>Kurze Updates zu Tools, Datenschutz und Produkt-Launches.</CardDescription>
        </CardHeader>
        <CardContent>
          <NewsletterForm />
        </CardContent>
      </Card>
    </div>
  );
}
