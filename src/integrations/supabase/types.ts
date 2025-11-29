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
        Relationships: []
      }
      facturas_boletas: {
        Row: {
          account_id: string | null
          archivo_nombre: string
          archivo_tamanio: number | null
          archivo_url: string
          created_at: string
          descripcion: string | null
          fecha_documento: string
          id: string
          monto: number | null
          telefono: string | null
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          archivo_nombre: string
          archivo_tamanio?: number | null
          archivo_url: string
          created_at?: string
          descripcion?: string | null
          fecha_documento: string
          id?: string
          monto?: number | null
          telefono?: string | null
          tipo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          archivo_nombre?: string
          archivo_tamanio?: number | null
          archivo_url?: string
          created_at?: string
          descripcion?: string | null
          fecha_documento?: string
          id?: string
          monto?: number | null
          telefono?: string | null
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
        Relationships: []
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
      metas: {
        Row: {
          created_at: string
          estado: string
          fecha_creacion: string
          fecha_limite: string | null
          id: string
          monto_actual: number
          monto_objetivo: number
          nombre_meta: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estado?: string
          fecha_creacion?: string
          fecha_limite?: string | null
          id?: string
          monto_actual?: number
          monto_objetivo: number
          nombre_meta: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          estado?: string
          fecha_creacion?: string
          fecha_limite?: string | null
          id?: string
          monto_actual?: number
          monto_objetivo?: number
          nombre_meta?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      presupuestos: {
        Row: {
          anio: number
          created_at: string
          fecha_creacion: string
          id: string
          mes: number
          monto_total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          anio: number
          created_at?: string
          fecha_creacion?: string
          id?: string
          mes: number
          monto_total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          anio?: number
          created_at?: string
          fecha_creacion?: string
          id?: string
          mes?: number
          monto_total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          currency: string | null
          display_name: string | null
          email: string
          entidad: string
          id: string
          phone_empresa: string | null
          phone_personal: string | null
          plan: string | null
          plan_renewal_date: string | null
          profile_complete: boolean | null
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
          country?: string | null
          created_at?: string
          currency?: string | null
          display_name?: string | null
          email: string
          entidad?: string
          id?: string
          phone_empresa?: string | null
          phone_personal?: string | null
          plan?: string | null
          plan_renewal_date?: string | null
          profile_complete?: boolean | null
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
          country?: string | null
          created_at?: string
          currency?: string | null
          display_name?: string | null
          email?: string
          entidad?: string
          id?: string
          phone_empresa?: string | null
          phone_personal?: string | null
          plan?: string | null
          plan_renewal_date?: string | null
          profile_complete?: boolean | null
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
        Relationships: []
      }
      usuarios: {
        Row: {
          country: string | null
          created_at: string | null
          currency: string | null
          id: string
          nombre: string | null
          plan: string | null
          plan_expires_at: string | null
          profile_complete: boolean | null
          reporte_mensual: boolean | null
          reporte_semanal: boolean | null
          telefono: string
          tipo_cuenta: string | null
          usage_count: number | null
          usage_month: string | null
          user_id: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          nombre?: string | null
          plan?: string | null
          plan_expires_at?: string | null
          profile_complete?: boolean | null
          reporte_mensual?: boolean | null
          reporte_semanal?: boolean | null
          telefono: string
          tipo_cuenta?: string | null
          usage_count?: number | null
          usage_month?: string | null
          user_id?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          nombre?: string | null
          plan?: string | null
          plan_expires_at?: string | null
          profile_complete?: boolean | null
          reporte_mensual?: boolean | null
          reporte_semanal?: boolean | null
          telefono?: string
          tipo_cuenta?: string | null
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
