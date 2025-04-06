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
        Relationships: []
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
      referral_codes: {
        Row: {
          id: string
          user_id: string
          code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          code: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          code?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          status: string
          referrer_rewarded: boolean
          referred_rewarded: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          status?: string
          referrer_rewarded?: boolean
          referred_rewarded?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          status?: string
          referrer_rewarded?: boolean
          referred_rewarded?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      bank_transfers: {
        Row: any
        Insert: any
        Update: any
        Relationships: any[]
      }
      investments: {
        Row: any
        Insert: any
        Update: any
        Relationships: any[]
      }
      notifications: {
        Row: any
        Insert: any
        Update: any
        Relationships: any[]
      }
      profiles: {
        Row: any
        Insert: any
        Update: any
        Relationships: any[]
      }
      project_documents: {
        Row: any
        Insert: any
        Update: any
        Relationships: any[]
      }
      project_updates: {
        Row: any
        Insert: any
        Update: any
        Relationships: any[]
      }
      projects: {
        Row: any
        Insert: any
        Update: any
        Relationships: any[]
      }
      scheduled_payments: {
        Row: any
        Insert: any
        Update: any
        Relationships: any[]
      }
      wallet_transactions: {
        Row: any
        Insert: any
        Update: any
        Relationships: any[]
      }
      withdrawal_requests: {
        Row: any
        Insert: any
        Update: any
        Relationships: any[]
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
      add_referral_reward: {
        Args: {
          user_id_param: string
          amount_param: number
          description_param: string
        }
        Returns: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
