"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const newsletterSchema = z.object({
  email: z.string().email("Bitte eine gültige E-Mail eingeben."),
  consent: z.boolean().default(true),
});

export async function subscribeToNewsletter(formData: FormData) {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    consent: formData.get("consent") === "on" || formData.get("consent") === "true",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().fieldErrors.email?.[0] };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("newsletter_subscriptions")
    .insert({ email: parsed.data.email, consent: parsed.data.consent });

  if (error) {
    // Duplicate entry (unique constraint) -> treat as success
    if (error.code === "23505") {
      return { ok: true, message: "Du bist bereits angemeldet." };
    }
    console.error("Newsletter konnte nicht gespeichert werden", error);
    return { ok: false, error: "Speichern fehlgeschlagen." };
  }

  revalidatePath("/newsletter");
  return { ok: true, message: "Danke! Wir halten dich auf dem Laufenden." };
}
