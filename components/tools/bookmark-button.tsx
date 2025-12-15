"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";

import { toggleBookmark } from "@/app/actions/bookmarks";
import { Button } from "@/components/ui/button";

type BookmarkButtonProps = {
  toolId: string;
  toolSlug?: string;
  initialBookmarked?: boolean;
};

export function BookmarkButton({ toolId, toolSlug, initialBookmarked }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(Boolean(initialBookmarked));
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    startTransition(async () => {
      const res = await toggleBookmark(toolId, toolSlug, "/mein-tool-stack").catch((err) => {
        if (String(err?.message).includes("auth-required")) {
          router.push("/login");
        }
        return { ok: false };
      });
      if (res?.ok) {
        setBookmarked((prev) => !prev);
        router.refresh();
      }
    });
  };

  return (
    <Button
      type="button"
      variant={bookmarked ? "secondary" : "ghost"}
      size="icon"
      className="rounded-full"
      onClick={handleToggle}
      onMouseDown={(event) => event.stopPropagation()}
      disabled={pending}
      aria-label={bookmarked ? "Bookmark entfernen" : "Zu Mein Tool Stack"}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : bookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
}
