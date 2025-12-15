import type { Database, Json } from "@/types/database.types";

export type ToolRecord = Database["public"]["Tables"]["tools"]["Row"];
export type NewsRecord = Database["public"]["Tables"]["news"]["Row"];
export type CategoryRecord = Database["public"]["Tables"]["categories"]["Row"];
export type TagRecord = Database["public"]["Tables"]["tags"]["Row"];
export type BookmarkRecord = Database["public"]["Tables"]["bookmarks"]["Row"];
export type NewsletterSubscriptionRecord =
  Database["public"]["Tables"]["newsletter_subscriptions"]["Row"];

type ToolOptionalColumns = {
  logo?: string | null;
  thumbnail?: string | null;
  rating_overall?: number | null;
  rating_gdpr?: number | null;
  is_recommended?: boolean | null;
  is_trending?: boolean | null;
  is_partner_offer?: boolean | null;
  is_new?: boolean | null;
  feature_flags?: string[] | null;
  cta_label?: string | null;
  social_proof?: Json | null;
  avv_dpa_details?: string | null;
  hosting_region_details?: string | null;
  risk_level_details?: string | null;
  avv_dpa_statuses?: string[] | null;
  hosting_regions?: string[] | null;
};

export type ToolWithRelations = ToolRecord &
  ToolOptionalColumns & {
    categories?: CategoryRecord[];
    tags?: TagRecord[];
  };

export type NewsWithTags = NewsRecord & {
  tags?: TagRecord[];
};

export type BookmarkWithTool = BookmarkRecord & {
  tool?: ToolWithRelations;
};
