export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action_type: Database["public"]["Enums"]["admin_action_type"]
          admin_id: string | null
          amount: number | null
          created_at: string | null
          description: string
          id: string
          target_project_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["admin_action_type"]
          admin_id?: string | null
          amount?: number | null
          created_at?: string | null
          description: string
          id?: string
          target_project_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["admin_action_type"]
          admin_id?: string | null
          amount?: number | null
          created_at?: string | null
          description?: string
          id?: string
          target_project_id?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_logs_target_project_id_fkey"
            columns: ["target_project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_login: string | null
          last_name: string | null
          password: string
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          password: string
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_login?: string | null
          last_name?: string | null
          password?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          date: string | null
          duration: number
          end_date: string | null
          id: string
          project_id: string | null
          status: string
          user_id: string | null
          yield_rate: number
        }
        Insert: {
          amount: number
          date?: string | null
          duration: number
          end_date?: string | null
          id?: string
          project_id?: string | null
          status?: string
          user_id?: string | null
          yield_rate: number
        }
        Update: {
          amount?: number
          date?: string | null
          duration?: number
          end_date?: string | null
          id?: string
          project_id?: string | null
          status?: string
          user_id?: string | null
          yield_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "investments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          investment_total: number | null
          last_name: string | null
          phone: string | null
          projects_count: number | null
          updated_at: string | null
          wallet_balance: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          investment_total?: number | null
          last_name?: string | null
          phone?: string | null
          projects_count?: number | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          investment_total?: number | null
          last_name?: string | null
          phone?: string | null
          projects_count?: number | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string
          company_name: string
          created_at: string | null
          description: string
          duration: string
          end_date: string | null
          featured: boolean | null
          funding_progress: number
          id: string
          image: string
          location: string
          min_investment: number
          name: string
          possible_durations: number[] | null
          price: number
          profitability: number
          raised: number | null
          start_date: string | null
          status: string
          target: number | null
          updated_at: string | null
          yield: number
        }
        Insert: {
          category: string
          company_name: string
          created_at?: string | null
          description: string
          duration: string
          end_date?: string | null
          featured?: boolean | null
          funding_progress: number
          id?: string
          image: string
          location: string
          min_investment: number
          name: string
          possible_durations?: number[] | null
          price: number
          profitability: number
          raised?: number | null
          start_date?: string | null
          status: string
          target?: number | null
          updated_at?: string | null
          yield: number
        }
        Update: {
          category?: string
          company_name?: string
          created_at?: string | null
          description?: string
          duration?: string
          end_date?: string | null
          featured?: boolean | null
          funding_progress?: number
          id?: string
          image?: string
          location?: string
          min_investment?: number
          name?: string
          possible_durations?: number[] | null
          price?: number
          profitability?: number
          raised?: number | null
          start_date?: string | null
          status?: string
          target?: number | null
          updated_at?: string | null
          yield?: number
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          admin_id: string | null
          amount: number
          bank_info: Json | null
          id: string
          notes: string | null
          processed_at: string | null
          requested_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          amount: number
          bank_info?: Json | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          requested_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          amount?: number
          bank_info?: Json | null
          id?: string
          notes?: string | null
          processed_at?: string | null
          requested_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_wallet_balance: {
        Args: {
          user_id: string
          increment_amount: number
        }
        Returns: undefined
      }
      is_admin: {
        Args: {
          user_email: string
        }
        Returns: boolean
      }
    }
    Enums: {
      admin_action_type:
        | "user_management"
        | "project_management"
        | "wallet_management"
        | "withdrawal_management"
        | "login"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
