"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Lock, LogIn, UserPlus } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "signup";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    setError(null);

    if (!email || !password) {
      setError("Bitte E-Mail und Passwort eingeben.");
      return;
    }

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const fn =
        mode === "login"
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({ email, password });

      const { error: authError } = await fn;

      if (authError) {
        setError(authError.message);
        return;
      }

      router.refresh();
      router.push("/");
    });
  }

  return (
    <Card className="max-w-lg border-white/5 bg-black/40">
      <CardHeader>
        <CardTitle>{mode === "login" ? "Login" : "Account erstellen"}</CardTitle>
        <CardDescription>Nutze Supabase Auth (E-Mail + Passwort).</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {mode === "login" ? "Einloggen" : "Registrieren"}
          </Button>
        </form>
        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>{mode === "login" ? "Noch kein Account?" : "Bereits registriert?"}</span>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            <Lock className="h-4 w-4" />
            {mode === "login" ? "Konto erstellen" : "Zum Login"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
