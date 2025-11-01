export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      match_players: {
        Row: {
          created_at: string
          id: string
          match_id: string
          player_name: string
          player_slot: number
          total_points: number
          user_id: string
          victory_points: number
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          player_name: string
          player_slot: number
          total_points?: number
          user_id: string
          victory_points?: number
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          player_name?: string
          player_slot?: number
          total_points?: number
          user_id?: string
          victory_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_spectators: {
        Row: {
          created_at: string
          id: string
          match_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_spectators_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_units: {
        Row: {
          attached_to_id: string | null
          attachment_type: string | null
          collection: string
          created_at: string
          id: string
          is_ko: boolean
          is_sideline: boolean
          match_id: string
          name: string
          number: string
          player_slot: number
          points: number
        }
        Insert: {
          attached_to_id?: string | null
          attachment_type?: string | null
          collection: string
          created_at?: string
          id?: string
          is_ko?: boolean
          is_sideline?: boolean
          match_id: string
          name: string
          number: string
          player_slot: number
          points: number
        }
        Update: {
          attached_to_id?: string | null
          attachment_type?: string | null
          collection?: string
          created_at?: string
          id?: string
          is_ko?: boolean
          is_sideline?: boolean
          match_id?: string
          name?: string
          number?: string
          player_slot?: number
          points?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_units_attached_to_id_fkey"
            columns: ["attached_to_id"]
            isOneToOne: false
            referencedRelation: "match_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_units_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          host_id: string
          id: string
          is_public: boolean
          name: string
          password_hash: string | null
          status: string
          timer_duration: number
          timer_last_update: string | null
          timer_remaining: number
          timer_state: string
        }
        Insert: {
          created_at?: string
          host_id: string
          id?: string
          is_public?: boolean
          name: string
          password_hash?: string | null
          status?: string
          timer_duration?: number
          timer_last_update?: string | null
          timer_remaining?: number
          timer_state?: string
        }
        Update: {
          created_at?: string
          host_id?: string
          id?: string
          is_public?: boolean
          name?: string
          password_hash?: string | null
          status?: string
          timer_duration?: number
          timer_last_update?: string | null
          timer_remaining?: number
          timer_state?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_teams: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_units: {
        Row: {
          attached_to_id: string | null
          attachment_type: string | null
          collection: string
          created_at: string
          id: string
          is_sideline: boolean
          name: string
          number: string
          points: number
          team_id: string
        }
        Insert: {
          attached_to_id?: string | null
          attachment_type?: string | null
          collection: string
          created_at?: string
          id?: string
          is_sideline?: boolean
          name: string
          number: string
          points: number
          team_id: string
        }
        Update: {
          attached_to_id?: string | null
          attachment_type?: string | null
          collection?: string
          created_at?: string
          id?: string
          is_sideline?: boolean
          name?: string
          number?: string
          points?: number
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_units_attached_to_id_fkey"
            columns: ["attached_to_id"]
            isOneToOne: false
            referencedRelation: "saved_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_units_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "saved_teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
