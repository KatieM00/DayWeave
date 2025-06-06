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
      plans: {
        Row: {
          id: string
          user_id: string
          title: string
          date: string
          events: Json
          total_cost: number
          total_duration: number
          preferences: Json
          weather_forecast: Json | null
          reveal_progress: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          date: string
          events: Json
          total_cost: number
          total_duration: number
          preferences: Json
          weather_forecast?: Json | null
          reveal_progress?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          date?: string
          events?: Json
          total_cost?: number
          total_duration?: number
          preferences?: Json
          weather_forecast?: Json | null
          reveal_progress?: number | null
          created_at?: string | null
        }
      }
      activity_suggestions_cache: {
        Row: {
          id: string
          user_id: string | null
          location: string
          query_params: Json
          suggestions: Json
          created_at: string | null
          expires_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          location: string
          query_params: Json
          suggestions: Json
          created_at?: string | null
          expires_at: string
        }
        Update: {
          id?: string
          user_id?: string | null
          location?: string
          query_params?: Json
          suggestions?: Json
          created_at?: string | null
          expires_at?: string
        }
      }
      budget_tracking: {
        Row: {
          id: string
          user_id: string | null
          category: string
          amount: number
          date: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          category: string
          amount: number
          date?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          category?: string
          amount?: number
          date?: string
          created_at?: string | null
        }
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          event_data: Json
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          event_data: Json
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          event_data?: Json
          created_at?: string | null
        }
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