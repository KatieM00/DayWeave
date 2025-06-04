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
          reveal_progress: number
          created_at: string
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
          reveal_progress?: number
          created_at?: string
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
          reveal_progress?: number
          created_at?: string
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
  }
}