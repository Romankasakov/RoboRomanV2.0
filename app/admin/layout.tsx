import type { ReactNode } from "react";

import { FadeIn } from "@/components/motion/fade-in";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { requireAdmin } from "@/lib/auth";

import { AdminNav } from "./_components/admin-nav";

export const metadata = {
  title: "Admin | RoboRoman",
  description: "Interner Admin-Bereich fuer Tools, News und Analytics.",
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="space-y-8 lg:space-y-10">
      <FadeIn className="space-y-6">
        <div className="space-y-3">
          <Badge variant="secondary" className="border border-primary/30 bg-primary/10 text-primary">
            Admin Cockpit
          </Badge>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-foreground">RoboRoman Control Center</h1>
            <p className="text-sm text-muted-foreground">
              Live-Daten, Tools und News mit Supabase-Backoffice synchronisieren.
            </p>
          </div>
        </div>
        <AdminNav />
      </FadeIn>
      <Separator className="bg-white/5" />
      <div className="pb-16">{children}</div>
    </div>
  );
}
