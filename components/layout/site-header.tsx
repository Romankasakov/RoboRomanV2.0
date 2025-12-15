"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LogOut, Menu, Plus, User } from "lucide-react";

import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; auth?: "any" | "authed" };

export function SiteHeader() {
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState<boolean>(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => setIsAuthed(Boolean(data.user)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(Boolean(session?.user));
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const navItems = useMemo<NavItem[]>(
    () => [
      { href: "/", label: "Home" },
      { href: "/neue-tools", label: "Neue Tools" },
      { href: "/news", label: "KI Nachrichten" },
      { href: "/mein-tool-stack", label: "Mein Tool Stack", auth: "authed" },
      { href: "/newsletter", label: "Newsletter" },
      { href: "/ueber-mich", label: "Ueber Mich" },
    ],
    []
  );

  const itemsForRender = navItems.filter((item) => item.auth !== "authed" || isAuthed);

  const renderLinks = (onClick?: () => void) => (
    <nav className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:gap-4">
      {itemsForRender.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-black/35 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 lg:px-6">
        <Link href="/" className="micro-animated flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">
            Robo<span className="text-primary">Roman</span>
          </span>
        </Link>

        <div className="hidden items-center gap-4 lg:flex">{renderLinks()}</div>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="outline" size="sm" className="gap-2 border-white/10 bg-white/5" asChild>
            <Link href="/newsletter#tool-vorschlagen">
              <Plus className="h-4 w-4" aria-hidden />
              Tool vorschlagen
            </Link>
          </Button>

          {isAuthed ? (
            <form action={logout}>
              <Button size="sm" className="gap-2">
                <LogOut className="h-4 w-4" aria-hidden />
                Logout
              </Button>
            </form>
          ) : (
            <Button size="sm" className="gap-2" asChild>
              <Link href="/login">
                <User className="h-4 w-4" aria-hidden />
                Login
              </Link>
            </Button>
          )}
        </div>

        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="icon" aria-label="Navigation oeffnen">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-background">
              <div className="mt-10 flex flex-col gap-6">
                {renderLinks()}
                <div className="flex flex-col gap-3">
                  <Button variant="outline" className="gap-2" asChild>
                    <Link href="/newsletter#tool-vorschlagen">
                      <Plus className="h-4 w-4" aria-hidden />
                      Tool vorschlagen
                    </Link>
                  </Button>

                  {isAuthed ? (
                    <form action={logout}>
                      <Button className="gap-2">
                        <LogOut className="h-4 w-4" aria-hidden />
                        Logout
                      </Button>
                    </form>
                  ) : (
                    <Button className="gap-2" asChild>
                      <Link href="/login">
                        <User className="h-4 w-4" aria-hidden />
                        Login
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
