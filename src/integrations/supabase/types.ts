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
      courier_applications: {
        Row: {
          applied_at: string | null
          city: string
          email: string
          experience: string | null
          full_name: string
          heard_from: string | null
          id: string
          phone: string
          status: string | null
          vehicle_type: string
        }
        Insert: {
          applied_at?: string | null
          city: string
          email: string
          experience?: string | null
          full_name: string
          heard_from?: string | null
          id?: string
          phone: string
          status?: string | null
          vehicle_type: string
        }
        Update: {
          applied_at?: string | null
          city?: string
          email?: string
          experience?: string | null
          full_name?: string
          heard_from?: string | null
          id?: string
          phone?: string
          status?: string | null
          vehicle_type?: string
        }
        Relationships: []
      }
      couriers: {
        Row: {
          created_at: string | null
          created_by_admin: boolean | null
          deliveries: number | null
          email: string
          id: string
          name: string
          notes: string | null
          password: string | null
          phone: string
          rating: number | null
          registered_at: string | null
          status: string
          vehicle_type: string
        }
        Insert: {
          created_at?: string | null
          created_by_admin?: boolean | null
          deliveries?: number | null
          email: string
          id?: string
          name: string
          notes?: string | null
          password?: string | null
          phone: string
          rating?: number | null
          registered_at?: string | null
          status?: string
          vehicle_type: string
        }
        Update: {
          created_at?: string | null
          created_by_admin?: boolean | null
          deliveries?: number | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          password?: string | null
          phone?: string
          rating?: number | null
          registered_at?: string | null
          status?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      driver_applications: {
        Row: {
          car_model: string
          car_year: string
          created_at: string
          email: string
          full_name: string
          id: string
          id_number: string
          license_number: string
          phone: string
          status: string
          user_auth_id: string
        }
        Insert: {
          car_model: string
          car_year: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          id_number: string
          license_number: string
          phone: string
          status?: string
          user_auth_id: string
        }
        Update: {
          car_model?: string
          car_year?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          id_number?: string
          license_number?: string
          phone?: string
          status?: string
          user_auth_id?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          car_model: string
          car_photos_url: string | null
          car_year: string
          created_at: string
          email: string
          full_name: string
          id: string
          id_document_url: string | null
          id_number: string
          license_document_url: string | null
          license_number: string
          phone: string
          profile_photo_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          car_model: string
          car_photos_url?: string | null
          car_year: string
          created_at?: string
          email: string
          full_name: string
          id: string
          id_document_url?: string | null
          id_number: string
          license_document_url?: string | null
          license_number: string
          phone: string
          profile_photo_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          car_model?: string
          car_photos_url?: string | null
          car_year?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          id_document_url?: string | null
          id_number?: string
          license_document_url?: string | null
          license_number?: string
          phone?: string
          profile_photo_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          order_id: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          order_id?: string | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          order_id?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string
          courier_assigned: string | null
          created_at: string
          customer_id: string
          customer_name: string
          id: string
          items: Json
          status: string
          store_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          address: string
          courier_assigned?: string | null
          created_at?: string
          customer_id: string
          customer_name: string
          id?: string
          items: Json
          status: string
          store_id: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          address?: string
          courier_assigned?: string | null
          created_at?: string
          customer_id?: string
          customer_name?: string
          id?: string
          items?: Json
          status?: string
          store_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_sessions: {
        Row: {
          created_at: string
          duration: number | null
          id: string
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          id?: string
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          id?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image: string
          images: string[] | null
          in_stock: boolean
          name: string
          price: number
          store_id: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image: string
          images?: string[] | null
          in_stock?: boolean
          name: string
          price: number
          store_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image?: string
          images?: string[] | null
          in_stock?: boolean
          name?: string
          price?: number
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          street: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          street?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          street?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      queries: {
        Row: {
          created_at: string
          customer_id: string
          customer_name: string
          id: string
          message: string
          response: string | null
          response_date: string | null
          status: string
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          customer_name: string
          id?: string
          message: string
          response?: string | null
          response_date?: string | null
          status: string
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          customer_name?: string
          id?: string
          message?: string
          response?: string | null
          response_date?: string | null
          status?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "queries_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      session_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_ai: boolean
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_ai?: boolean
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_ai?: boolean
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "practice_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string
          categories: string[]
          created_at: string
          description: string
          email: string
          id: string
          logo: string | null
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          address: string
          categories: string[]
          created_at?: string
          description: string
          email: string
          id?: string
          logo?: string | null
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string
          categories?: string[]
          created_at?: string
          description?: string
          email?: string
          id?: string
          logo?: string | null
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_alerts: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
          value?: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
