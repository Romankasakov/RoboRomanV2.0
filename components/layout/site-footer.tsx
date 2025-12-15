import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-semibold text-foreground">RoboRoman</p>
          <p className="text-muted-foreground">
            KI-Tools & Nachrichten für den DACH-Raum. Keine Rechtsberatung.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/impressum" className="hover:text-primary">
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:text-primary">
            Datenschutz
          </Link>
          <Link href="/newsletter" className="hover:text-primary">
            Newsletter
          </Link>
        </div>
      </div>
    </footer>
  );
}
