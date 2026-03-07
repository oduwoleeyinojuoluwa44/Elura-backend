export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      artists: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          full_name: string;
          bio: string | null;
          location: string | null;
          specialty: string[];
          price_range: string | null;
          instagram_handle: string | null;
          profile_image_url: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          full_name: string;
          bio?: string | null;
          location?: string | null;
          specialty?: string[];
          price_range?: string | null;
          instagram_handle?: string | null;
          profile_image_url?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          full_name?: string;
          bio?: string | null;
          location?: string | null;
          specialty?: string[];
          price_range?: string | null;
          instagram_handle?: string | null;
          profile_image_url?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

