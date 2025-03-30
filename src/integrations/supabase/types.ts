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
          action_type: string
          admin_id: string | null
          amount: number | null
          created_at: string
          description: string | null
          id: string
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          admin_id?: string | null
          amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string | null
          amount?: number | null
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          role?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      bank_transfers: {
        Row: {
          amount: number | null
          confirmed_at: string | null
          id: string
          notes: string | null
          processed: boolean | null
          processed_at: string | null
          reference: string
          status: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          confirmed_at?: string | null
          id?: string
          notes?: string | null
          processed?: boolean | null
          processed_at?: string | null
          reference: string
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          confirmed_at?: string | null
          id?: string
          notes?: string | null
          processed?: boolean | null
          processed_at?: string | null
          reference?: string
          status?: string | null
          user_id?: string
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
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          seen: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          seen?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          seen?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          investment_total: number | null
          last_active_at: string | null
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
          last_active_at?: string | null
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
          last_active_at?: string | null
          last_name?: string | null
          phone?: string | null
          projects_count?: number | null
          updated_at?: string | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      project_documents: {
        Row: {
          created_at: string
          file_size: string | null
          file_type: string
          file_url: string
          id: string
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_size?: string | null
          file_type: string
          file_url: string
          id?: string
          name: string
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_size?: string | null
          file_type?: string
          file_url?: string
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          created_at: string
          details: string
          id: string
          project_id: string
          title: string
          update_type: string
        }
        Insert: {
          created_at?: string
          details: string
          id?: string
          project_id: string
          title: string
          update_type: string
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          project_id?: string
          title?: string
          update_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
          first_payment_delay_months: number | null
          funding_progress: number
          id: string
          image: string
          investment_model: string | null
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
          first_payment_delay_months?: number | null
          funding_progress: number
          id?: string
          image: string
          investment_model?: string | null
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
          first_payment_delay_months?: number | null
          funding_progress?: number
          id?: string
          image?: string
          investment_model?: string | null
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
      scheduled_payments: {
        Row: {
          created_at: string
          id: string
          investors_count: number | null
          payment_date: string
          percentage: number
          processed_at: string | null
          project_id: string
          status: string
          total_invested_amount: number | null
          total_scheduled_amount: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          investors_count?: number | null
          payment_date: string
          percentage?: number
          processed_at?: string | null
          project_id: string
          status: string
          total_invested_amount?: number | null
          total_scheduled_amount?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          investors_count?: number | null
          payment_date?: string
          percentage?: number
          processed_at?: string | null
          project_id?: string
          status?: string
          total_invested_amount?: number | null
          total_scheduled_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          receipt_confirmed: boolean | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          receipt_confirmed?: boolean | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          receipt_confirmed?: boolean | null
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
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_all_profiles_to_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      admin_mark_bank_transfer: {
        Args: {
          transfer_id: string
          new_status: string
          is_processed: boolean
          notes: string
        }
        Returns: boolean
      }
      admin_update_bank_transfer: {
        Args: {
          transfer_id: string
          new_status: string
          processed: boolean
          notes: string
        }
        Returns: boolean
      }
      decrement_wallet_balance: {
        Args: {
          user_id: string
          decrement_amount: number
        }
        Returns: number
      }
      increment_wallet_balance: {
        Args: {
          user_id: string
          increment_amount: number
        }
        Returns: undefined
      }
      initialize_all_projects_scheduled_payments: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      initialize_project_scheduled_payments: {
        Args: {
          project_uuid: string
        }
        Returns: undefined
      }
      is_admin:
        | {
            Args: Record<PropertyKey, never>
            Returns: boolean
          }
        | {
            Args: {
              user_email: string
            }
            Returns: boolean
          }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      recalculate_wallet_balance: {
        Args: {
          user_uuid: string
        }
        Returns: undefined
      }
      update_user_profile_investment: {
        Args: {
          user_id: string
          investment_amount: number
        }
        Returns: undefined
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
