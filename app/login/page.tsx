import { AuthForm } from "@/components/auth/auth-form";
import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Login | RoboRoman",
  description: "Supabase Login oder Signup fuer RoboRoman.",
};

export default function LoginPage() {
  return (
    <div className="space-y-8 lg:space-y-12">
      <FadeIn className="space-y-3">
        <Badge variant="secondary" className="border border-primary/30 bg-primary/10 text-primary">
          Mitgliederbereich
        </Badge>
        <h1 className="text-3xl font-semibold text-foreground">Anmelden oder Registrieren</h1>
        <p className="text-muted-foreground">
          Nutzt Supabase Auth. Nach Login kannst du Tools in &quot;Mein Tool Stack&quot; speichern.
        </p>
      </FadeIn>

      <AuthForm />
    </div>
  );
}
