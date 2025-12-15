"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Mail } from "lucide-react";

import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type FormState = {
  ok?: boolean;
  message?: string;
  error?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full gap-2" disabled={pending}>
      {pending ? "Wird gesendet..." : "Jetzt abonnieren"}
      <Mail className="h-4 w-4" />
    </Button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useFormState<FormState, FormData>(async (_prev, formData) => {
    const res = await subscribeToNewsletter(formData);
    return res;
  }, {});

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="du@example.com"
          className="h-12 text-base"
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Updates erhalten</p>
          <p className="text-xs text-muted-foreground">Einverstanden mit E-Mail-Versand.</p>
        </div>
        <Switch name="consent" defaultChecked aria-label="Newsletter Zustimmung" />
      </div>
      <SubmitButton />
      {state?.message ? <p className="text-sm text-primary">{state.message}</p> : null}
      {state?.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
    </form>
  );
}
