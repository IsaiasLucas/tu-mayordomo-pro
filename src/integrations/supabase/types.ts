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
      accounts: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      company_members: {
        Row: {
          active: boolean | null
          company_id: string
          created_at: string | null
          id: string
          role: string | null
          telefono: string
        }
        Insert: {
          active?: boolean | null
          company_id: string
          created_at?: string | null
          id?: string
          role?: string | null
          telefono: string
        }
        Update: {
          active?: boolean | null
          company_id?: string
          created_at?: string | null
          id?: string
          role?: string | null
          telefono?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["user_id"]
          },
        ]
      }
      entities: {
        Row: {
          account_id: string | null
          created_at: string
          id: string
          nombre_legal: string | null
          rut: string | null
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          id?: string
          nombre_legal?: string | null
          rut?: string | null
          tipo?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          created_at?: string
          id?: string
          nombre_legal?: string | null
          rut?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      gastos: {
        Row: {
          account_id: string | null
          categoria: string | null
          created_at: string | null
          descripcion: string | null
          detalles: string | null
          fecha: string | null
          id: string
          monto: number | null
          subtipo: string | null
          telefono: string
          tipo: string | null
          user_id: string | null
        }
        Insert: {
          account_id?: string | null
          categoria?: string | null
          created_at?: string | null
          descripcion?: string | null
          detalles?: string | null
          fecha?: string | null
          id?: string
          monto?: number | null
          subtipo?: string | null
          telefono: string
          tipo?: string | null
          user_id?: string | null
        }
        Update: {
          account_id?: string | null
          categoria?: string | null
          created_at?: string | null
          descripcion?: string | null
          detalles?: string | null
          fecha?: string | null
          id?: string
          monto?: number | null
          subtipo?: string | null
          telefono?: string
          tipo?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gastos_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_codes: {
        Row: {
          code: string
          company_id: string
          created_at: string
          id: string
        }
        Insert: {
          code: string
          company_id: string
          created_at?: string
          id?: string
        }
        Update: {
          code?: string
          company_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_codes_company_id_fkey1"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          entidad: string
          id: string
          phone_empresa: string | null
          phone_personal: string | null
          plan: string | null
          plan_renewal_date: string | null
          stripe_customer_id: string | null
          stripe_customer_id_updated_at: string | null
          stripe_subscription_id: string | null
          student_email: string | null
          student_trial_end: string | null
          student_verification_status: string | null
          student_verified: boolean | null
          updated_at: string
          user_id: string
          whatsapp_configured: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          entidad?: string
          id?: string
          phone_empresa?: string | null
          phone_personal?: string | null
          plan?: string | null
          plan_renewal_date?: string | null
          stripe_customer_id?: string | null
          stripe_customer_id_updated_at?: string | null
          stripe_subscription_id?: string | null
          student_email?: string | null
          student_trial_end?: string | null
          student_verification_status?: string | null
          student_verified?: boolean | null
          updated_at?: string
          user_id: string
          whatsapp_configured?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          entidad?: string
          id?: string
          phone_empresa?: string | null
          phone_personal?: string | null
          plan?: string | null
          plan_renewal_date?: string | null
          stripe_customer_id?: string | null
          stripe_customer_id_updated_at?: string | null
          stripe_subscription_id?: string | null
          student_email?: string | null
          student_trial_end?: string | null
          student_verification_status?: string | null
          student_verified?: boolean | null
          updated_at?: string
          user_id?: string
          whatsapp_configured?: boolean | null
        }
        Relationships: []
      }
      reportes: {
        Row: {
          account_id: string | null
          created_at: string
          data: Json | null
          id: string
          pdf_url: string | null
          periodo: string
          phone: string
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          pdf_url?: string | null
          periodo: string
          phone: string
          tipo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          pdf_url?: string | null
          periodo?: string
          phone?: string
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reportes_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      student_verifications: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          user_id: string
          verification_data: Json | null
          verification_type: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          verification_data?: Json | null
          verification_type: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          verification_data?: Json | null
          verification_type?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          created_at: string | null
          id: string
          plan: string | null
          plan_expires_at: string | null
          reporte_mensual: boolean | null
          reporte_semanal: boolean | null
          telefono: string
          usage_count: number | null
          usage_month: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          plan?: string | null
          plan_expires_at?: string | null
          reporte_mensual?: boolean | null
          reporte_semanal?: boolean | null
          telefono: string
          usage_count?: number | null
          usage_month?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          plan?: string | null
          plan_expires_at?: string | null
          reporte_mensual?: boolean | null
          reporte_semanal?: boolean | null
          telefono?: string
          usage_count?: number | null
          usage_month?: string | null
          user_id?: string | null
        }
        Relationships: []
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
