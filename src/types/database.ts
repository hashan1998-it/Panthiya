export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      attendance: {
        Row: {
          class_id: string;
          created_at: string;
          id: string;
          session_date: string;
          status: Database["public"]["Enums"]["attendance_status"];
          student_id: string;
        };
        ComputedFields: never;
        Insert: {
          class_id: string;
          created_at?: string;
          id?: string;
          session_date: string;
          status: Database["public"]["Enums"]["attendance_status"];
          student_id: string;
        };
        Update: {
          class_id?: string;
          created_at?: string;
          id?: string;
          session_date?: string;
          status?: Database["public"]["Enums"]["attendance_status"];
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendance_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      classes: {
        Row: {
          created_at: string;
          day_of_week: number;
          end_time: string;
          grade: number;
          id: string;
          is_active: boolean;
          monthly_fee: number;
          start_time: string;
          subject: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          day_of_week: number;
          end_time: string;
          grade: number;
          id?: string;
          is_active?: boolean;
          monthly_fee: number;
          start_time: string;
          subject: string;
        };
        Update: {
          created_at?: string;
          day_of_week?: number;
          end_time?: string;
          grade?: number;
          id?: string;
          is_active?: boolean;
          monthly_fee?: number;
          start_time?: string;
          subject?: string;
        };
        Relationships: [];
      };
      dues: {
        Row: {
          amount_due: number;
          created_at: string;
          enrollment_id: string;
          id: string;
          month: string;
        };
        ComputedFields: never;
        Insert: {
          amount_due: number;
          created_at?: string;
          enrollment_id: string;
          id?: string;
          month: string;
        };
        Update: {
          amount_due?: number;
          created_at?: string;
          enrollment_id?: string;
          id?: string;
          month?: string;
        };
        Relationships: [
          {
            foreignKeyName: "dues_enrollment_id_fkey";
            columns: ["enrollment_id"];
            isOneToOne: false;
            referencedRelation: "enrollments";
            referencedColumns: ["id"];
          },
        ];
      };
      enrollments: {
        Row: {
          class_id: string;
          created_at: string;
          discount_percent: number;
          discount_type: Database["public"]["Enums"]["discount_type"];
          ended_on: string | null;
          enrolled_on: string;
          id: string;
          student_id: string;
        };
        ComputedFields: never;
        Insert: {
          class_id: string;
          created_at?: string;
          discount_percent?: number;
          discount_type?: Database["public"]["Enums"]["discount_type"];
          ended_on?: string | null;
          enrolled_on: string;
          id?: string;
          student_id: string;
        };
        Update: {
          class_id?: string;
          created_at?: string;
          discount_percent?: number;
          discount_type?: Database["public"]["Enums"]["discount_type"];
          ended_on?: string | null;
          enrolled_on?: string;
          id?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enrollments_class_id_fkey";
            columns: ["class_id"];
            isOneToOne: false;
            referencedRelation: "classes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enrollments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string;
          due_id: string;
          id: string;
          method: Database["public"]["Enums"]["payment_method"];
          paid_on: string;
          receipt_no: string;
          voided_at: string | null;
        };
        ComputedFields: never;
        Insert: {
          amount: number;
          created_at?: string;
          due_id: string;
          id?: string;
          method?: Database["public"]["Enums"]["payment_method"];
          paid_on: string;
          receipt_no?: string;
          voided_at?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string;
          due_id?: string;
          id?: string;
          method?: Database["public"]["Enums"]["payment_method"];
          paid_on?: string;
          receipt_no?: string;
          voided_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "payments_due_id_fkey";
            columns: ["due_id"];
            isOneToOne: false;
            referencedRelation: "dues";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          locale: Database["public"]["Enums"]["app_locale"];
          role: Database["public"]["Enums"]["user_role"];
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          full_name: string;
          id: string;
          locale?: Database["public"]["Enums"]["app_locale"];
          role?: Database["public"]["Enums"]["user_role"];
        };
        Update: {
          created_at?: string;
          full_name?: string;
          id?: string;
          locale?: Database["public"]["Enums"]["app_locale"];
          role?: Database["public"]["Enums"]["user_role"];
        };
        Relationships: [];
      };
      students: {
        Row: {
          admission_no: string;
          created_at: string;
          full_name: string;
          grade: number;
          id: string;
          is_active: boolean;
          joined_on: string;
          parent_name: string | null;
          parent_phone: string | null;
          phone: string | null;
          profile_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          admission_no: string;
          created_at?: string;
          full_name: string;
          grade: number;
          id?: string;
          is_active?: boolean;
          joined_on: string;
          parent_name?: string | null;
          parent_phone?: string | null;
          phone?: string | null;
          profile_id?: string | null;
        };
        Update: {
          admission_no?: string;
          created_at?: string;
          full_name?: string;
          grade?: number;
          id?: string;
          is_active?: boolean;
          joined_on?: string;
          parent_name?: string | null;
          parent_phone?: string | null;
          phone?: string | null;
          profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "students_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_locale: "en" | "si";
      attendance_status: "present" | "absent" | "late";
      discount_type: "none" | "half" | "free" | "custom";
      payment_method: "cash" | "bank_transfer";
      user_role: "admin" | "student";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_locale: ["en", "si"],
      attendance_status: ["present", "absent", "late"],
      discount_type: ["none", "half", "free", "custom"],
      payment_method: ["cash", "bank_transfer"],
      user_role: ["admin", "student"],
    },
  },
} as const;
