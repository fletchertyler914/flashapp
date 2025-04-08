export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      parents: {
        Row: {
          id: string
          email: string
          created_at: string
          is_admin: boolean
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          is_admin?: boolean
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          is_admin?: boolean
        }
      }
      children: {
        Row: {
          id: string
          parent_id: string
          name: string
          age: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          name: string
          age?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          name?: string
          age?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      characters: {
        Row: {
          id: number
          value: string
          type: "letter" | "number"
        }
        Insert: {
          id?: number
          value: string
          type: "letter" | "number"
        }
        Update: {
          id?: number
          value?: string
          type?: "letter" | "number"
        }
      }
      progress: {
        Row: {
          id: string
          child_id: string
          character_id: number
          correct: number
          incorrect: number
          last_practiced: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          character_id: number
          correct?: number
          incorrect?: number
          last_practiced?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          character_id?: number
          correct?: number
          incorrect?: number
          last_practiced?: string
          created_at?: string
          updated_at?: string
        }
      }
      practice_sessions: {
        Row: {
          id: string
          child_id: string
          started_at: string
          ended_at: string | null
          duration: number | null
        }
        Insert: {
          id?: string
          child_id: string
          started_at?: string
          ended_at?: string | null
          duration?: number | null
        }
        Update: {
          id?: string
          child_id?: string
          started_at?: string
          ended_at?: string | null
          duration?: number | null
        }
      }
      session_results: {
        Row: {
          id: string
          session_id: string
          character_id: number
          result: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          character_id: number
          result: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          character_id?: number
          result?: boolean
          created_at?: string
        }
      }
    }
  }
}
