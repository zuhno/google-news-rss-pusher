export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      App: {
        Row: {
          authorize_link: string
          category_id: number
          client_id: string | null
          client_secret: string | null
          created_at: string
          from: Database["public"]["Enums"]["AppFrom"]
          id: string
          updated_at: string
        }
        Insert: {
          authorize_link: string
          category_id: number
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          from: Database["public"]["Enums"]["AppFrom"]
          id: string
          updated_at?: string
        }
        Update: {
          authorize_link?: string
          category_id?: number
          client_id?: string | null
          client_secret?: string | null
          created_at?: string
          from?: Database["public"]["Enums"]["AppFrom"]
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "App_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          }
        ]
      }
      Category: {
        Row: {
          id: number
          title: string
        }
        Insert: {
          id: number
          title: string
        }
        Update: {
          id?: number
          title?: string
        }
        Relationships: []
      }
      Feed: {
        Row: {
          category_id: number
          created_at: string
          id: number
          link: string | null
          preview_url: string | null
          publisher: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          category_id: number
          created_at?: string
          id?: number
          link?: string | null
          preview_url?: string | null
          publisher?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: number
          created_at?: string
          id?: number
          link?: string | null
          preview_url?: string | null
          publisher?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Feed_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          }
        ]
      }
      Interval: {
        Row: {
          time: number
        }
        Insert: {
          time: number
        }
        Update: {
          time?: number
        }
        Relationships: []
      }
      Release: {
        Row: {
          app_id: string
          created_at: string
          interval_time: number
          last_feed_id: number
          updated_at: string
        }
        Insert: {
          app_id: string
          created_at?: string
          interval_time: number
          last_feed_id: number
          updated_at?: string
        }
        Update: {
          app_id?: string
          created_at?: string
          interval_time?: number
          last_feed_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Release_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "App"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Release_interval_time_fkey"
            columns: ["interval_time"]
            isOneToOne: false
            referencedRelation: "Interval"
            referencedColumns: ["time"]
          },
          {
            foreignKeyName: "Release_last_feed_id_fkey"
            columns: ["last_feed_id"]
            isOneToOne: false
            referencedRelation: "Feed"
            referencedColumns: ["id"]
          }
        ]
      }
      Subscriber: {
        Row: {
          active: boolean
          app_id: string
          ch_id: string
          ch_name: string | null
          ch_url: string | null
          created_at: string
          deactive_reason: Database["public"]["Enums"]["DeactiveReason"] | null
          interval_time: number
          team_id: string | null
          updated_at: string
          user_id: number | null
        }
        Insert: {
          active?: boolean
          app_id: string
          ch_id: string
          ch_name?: string | null
          ch_url?: string | null
          created_at?: string
          deactive_reason?: Database["public"]["Enums"]["DeactiveReason"] | null
          interval_time: number
          team_id?: string | null
          updated_at?: string
          user_id?: number | null
        }
        Update: {
          active?: boolean
          app_id?: string
          ch_id?: string
          ch_name?: string | null
          ch_url?: string | null
          created_at?: string
          deactive_reason?: Database["public"]["Enums"]["DeactiveReason"] | null
          interval_time?: number
          team_id?: string | null
          updated_at?: string
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Subscriber_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "App"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Subscriber_interval_time_fkey"
            columns: ["interval_time"]
            isOneToOne: false
            referencedRelation: "Interval"
            referencedColumns: ["time"]
          },
          {
            foreignKeyName: "Subscriber_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
        ]
      }
      User: {
        Row: {
          active: boolean
          avatar_url: string | null
          created_at: string
          email: string | null
          id: number
          nick_name: string | null
          platform: Database["public"]["Enums"]["SocialPlatform"] | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: number
          nick_name?: string | null
          platform?: Database["public"]["Enums"]["SocialPlatform"] | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: number
          nick_name?: string | null
          platform?: Database["public"]["Enums"]["SocialPlatform"] | null
          updated_at?: string
        }
        Relationships: []
      }
      UserAuth: {
        Row: {
          access_token: string
          created_at: string
          refresh_token: string
          request_config: string
          updated_at: string
          userId: number
        }
        Insert: {
          access_token: string
          created_at?: string
          refresh_token: string
          request_config: string
          updated_at?: string
          userId?: number
        }
        Update: {
          access_token?: string
          created_at?: string
          refresh_token?: string
          request_config?: string
          updated_at?: string
          userId?: number
        }
        Relationships: []
      }
      UserRole: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["MemberRole"] | null
          updated_at: string
          user_id: number
        }
        Insert: {
          created_at?: string
          role?: Database["public"]["Enums"]["MemberRole"] | null
          updated_at?: string
          user_id: number
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["MemberRole"] | null
          updated_at?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "UserRole_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "User"
            referencedColumns: ["id"]
          }
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
      AppFrom: "SLACK"
      DeactiveReason: "NOT_FOUND" | "USER_REQUEST" | "BAN" | "UNKOWN"
      MemberRole: "OWNER" | "ADMIN" | "USER_BASIC"
      Reason: "NOT_FOUND" | "USER_REQUEST" | "UNKOWN"
      SocialPlatform: "GOOGLE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
