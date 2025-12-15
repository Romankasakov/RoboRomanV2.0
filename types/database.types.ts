export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          tool_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          tool_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          tool_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookmarks_tool_id_fkey";
            columns: ["tool_id"];
            referencedRelation: "tools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          description: string | null;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          description?: string | null;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          description?: string | null;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      click_events: {
        Row: {
          created_at: string;
          id: number;
          referrer: string | null;
          tool_id: string;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          referrer?: string | null;
          tool_id: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          referrer?: string | null;
          tool_id?: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "click_events_tool_id_fkey";
            columns: ["tool_id"];
            referencedRelation: "tools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "click_events_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      news: {
        Row: {
          content: string | null;
          created_at: string;
          excerpt: string | null;
          id: string;
          image_url: string | null;
          published_at: string;
          slug: string;
          sources: Json | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          image_url?: string | null;
          published_at?: string;
          slug: string;
          sources?: Json | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          excerpt?: string | null;
          id?: string;
          image_url?: string | null;
          published_at?: string;
          slug?: string;
          sources?: Json | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      news_tags: {
        Row: {
          news_id: string;
          tag_id: string;
        };
        Insert: {
          news_id: string;
          tag_id: string;
        };
        Update: {
          news_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "news_tags_news_id_fkey";
            columns: ["news_id"];
            referencedRelation: "news";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "news_tags_tag_id_fkey";
            columns: ["tag_id"];
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      newsletter_subscriptions: {
        Row: {
          consent: boolean | null;
          created_at: string;
          email: string;
          id: string;
        };
        Insert: {
          consent?: boolean | null;
          created_at?: string;
          email: string;
          id?: string;
        };
        Update: {
          consent?: boolean | null;
          created_at?: string;
          email?: string;
          id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          scope: "tool" | "news" | "both";
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          scope?: "tool" | "news" | "both";
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          scope?: "tool" | "news" | "both";
          slug?: string;
        };
        Relationships: [];
      };
      tool_categories: {
        Row: {
          category_id: string;
          tool_id: string;
        };
        Insert: {
          category_id: string;
          tool_id: string;
        };
        Update: {
          category_id?: string;
          tool_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tool_categories_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tool_categories_tool_id_fkey";
            columns: ["tool_id"];
            referencedRelation: "tools";
            referencedColumns: ["id"];
          },
        ];
      };
      tool_tags: {
        Row: {
          tag_id: string;
          tool_id: string;
        };
        Insert: {
          tag_id: string;
          tool_id: string;
        };
        Update: {
          tag_id?: string;
          tool_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tool_tags_tag_id_fkey";
            columns: ["tag_id"];
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tool_tags_tool_id_fkey";
            columns: ["tool_id"];
            referencedRelation: "tools";
            referencedColumns: ["id"];
          },
        ];
      };
      tools: {
        Row: {
          affiliate_url: string | null;
          avv_dpa: string | null;
          avv_dpa_details: string | null;
          avv_dpa_statuses: string[] | null;
          beschreibung: string | null;
          community_rating: number | null;
          created_at: string;
          cta_label: string | null;
          data_type_notes: string | null;
          data_types: Json | null;
          feature_flags: string[] | null;
          gdpr_score: number | null;
          hosting_region: string | null;
          hosting_region_details: string | null;
          hosting_regions: string[] | null;
          id: string;
          is_featured: boolean | null;
          is_new: boolean | null;
          is_recommended: boolean | null;
          is_trending: boolean | null;
          kurzbeschreibung: string | null;
          last_checked_at: string | null;
          logo_url: string | null;
          name: string;
          partner_offer: boolean | null;
          plattform: string | null;
          preismodell: string | null;
          rating_gdpr: number | null;
          rating_overall: number | null;
          risk_level: string | null;
          risk_level_details: string | null;
          security_measures: Json | null;
          security_notes: string | null;
          slug: string;
          social_proof: Json | null;
          sources: Json | null;
          subprocessors: string | null;
          thumbnail_url: string | null;
          updated_at: string;
          use_case: string | null;
          zusammenfassung: string | null;
        };
        Insert: {
          affiliate_url?: string | null;
          avv_dpa?: string | null;
          avv_dpa_details?: string | null;
          avv_dpa_statuses?: string[] | null;
          beschreibung?: string | null;
          community_rating?: number | null;
          created_at?: string;
          cta_label?: string | null;
          data_type_notes?: string | null;
          data_types?: Json | null;
          feature_flags?: string[] | null;
          gdpr_score?: number | null;
          hosting_region?: string | null;
          hosting_region_details?: string | null;
          hosting_regions?: string[] | null;
          id?: string;
          is_featured?: boolean | null;
          is_new?: boolean | null;
          is_recommended?: boolean | null;
          is_trending?: boolean | null;
          kurzbeschreibung?: string | null;
          last_checked_at?: string | null;
          logo_url?: string | null;
          name: string;
          partner_offer?: boolean | null;
          plattform?: string | null;
          preismodell?: string | null;
          rating_gdpr?: number | null;
          rating_overall?: number | null;
          risk_level?: string | null;
          risk_level_details?: string | null;
          security_measures?: Json | null;
          security_notes?: string | null;
          slug: string;
          social_proof?: Json | null;
          sources?: Json | null;
          subprocessors?: string | null;
          thumbnail_url?: string | null;
          updated_at?: string;
          use_case?: string | null;
          zusammenfassung?: string | null;
        };
        Update: {
          affiliate_url?: string | null;
          avv_dpa?: string | null;
          avv_dpa_details?: string | null;
          avv_dpa_statuses?: string[] | null;
          beschreibung?: string | null;
          community_rating?: number | null;
          created_at?: string;
          cta_label?: string | null;
          data_type_notes?: string | null;
          data_types?: Json | null;
          feature_flags?: string[] | null;
          gdpr_score?: number | null;
          hosting_region?: string | null;
          hosting_region_details?: string | null;
          hosting_regions?: string[] | null;
          id?: string;
          is_featured?: boolean | null;
          is_new?: boolean | null;
          is_recommended?: boolean | null;
          is_trending?: boolean | null;
          kurzbeschreibung?: string | null;
          last_checked_at?: string | null;
          logo_url?: string | null;
          name?: string;
          partner_offer?: boolean | null;
          plattform?: string | null;
          preismodell?: string | null;
          rating_gdpr?: number | null;
          rating_overall?: number | null;
          risk_level?: string | null;
          risk_level_details?: string | null;
          security_measures?: Json | null;
          security_notes?: string | null;
          slug?: string;
          social_proof?: Json | null;
          sources?: Json | null;
          subprocessors?: string | null;
          thumbnail_url?: string | null;
          updated_at?: string;
          use_case?: string | null;
          zusammenfassung?: string | null;
        };
        Relationships: [];
      };
      tool_votes: {
        Row: {
          created_at: string;
          id: string;
          tool_id: string;
          user_id: string;
          vote_type: "up" | "down";
        };
        Insert: {
          created_at?: string;
          id?: string;
          tool_id: string;
          user_id: string;
          vote_type: "up" | "down";
        };
        Update: {
          created_at?: string;
          id?: string;
          tool_id?: string;
          user_id?: string;
          vote_type?: "up" | "down";
        };
        Relationships: [
          {
            foreignKeyName: "tool_votes_tool_id_fkey";
            columns: ["tool_id"];
            referencedRelation: "tools";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tool_votes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "member" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          public: boolean | null;
          updated_at: string | null;
          file_size_limit_max: number | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
          file_size_limit_max?: number | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
          file_size_limit_max?: number | null;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey";
            columns: ["bucket_id"];
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {};
    Enums: {};
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
