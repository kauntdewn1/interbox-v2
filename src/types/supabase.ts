// ============================================================================
// TIPOS DO SUPABASE - GERADOS AUTOMATICAMENTE
// ============================================================================

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
      users: {
        Row: {
          id: string
          clerk_id: string
          email: string
          display_name: string | null
          photo_url: string | null
          role: string
          created_at: string
          updated_at: string
          box: string | null
          cidade: string | null
          is_active: boolean
          profile_complete: boolean
          test_user: boolean
        }
        Insert: {
          id?: string
          clerk_id: string
          email: string
          display_name?: string | null
          photo_url?: string | null
          role: string
          created_at?: string
          updated_at?: string
          box?: string | null
          cidade?: string | null
          is_active?: boolean
          profile_complete?: boolean
          test_user?: boolean
        }
        Update: {
          id?: string
          clerk_id?: string
          email?: string
          display_name?: string | null
          photo_url?: string | null
          role?: string
          created_at?: string
          updated_at?: string
          box?: string | null
          cidade?: string | null
          is_active?: boolean
          profile_complete?: boolean
          test_user?: boolean
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          id: string
          user_id: string
          box_tokens: number
          total_earned: number
          total_spent: number
          level: string
          achievements: string[]
          last_action: string | null
          last_daily_login: string | null
          login_streak: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          box_tokens?: number
          total_earned?: number
          total_spent?: number
          level?: string
          achievements?: string[]
          last_action?: string | null
          last_daily_login?: string | null
          login_streak?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          box_tokens?: number
          total_earned?: number
          total_spent?: number
          level?: string
          achievements?: string[]
          last_action?: string | null
          last_daily_login?: string | null
          login_streak?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_gamification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      gamification_actions: {
        Row: {
          id: string
          user_id: string
          action: string
          tokens_earned: number
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          tokens_earned: number
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          tokens_earned?: number
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamification_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount: number
          currency: string
          status: string
          payment_method: string
          correlation_id: string
          created_at: string
          updated_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          currency?: string
          status?: string
          payment_method: string
          correlation_id: string
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          currency?: string
          status?: string
          payment_method?: string
          correlation_id?: string
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          id: string
          name: string
          description: string
          start_date: string
          end_date: string
          location: string
          max_participants: number
          current_participants: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          start_date: string
          end_date: string
          location: string
          max_participants: number
          current_participants?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          start_date?: string
          end_date?: string
          location?: string
          max_participants?: number
          current_participants?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          id: string
          user_id: string
          event_id: string
          category: string
          lot: string
          status: string
          payment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          category: string
          lot: string
          status?: string
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          category?: string
          lot?: string
          status?: string
          payment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          }
        ]
      }
      sponsors: {
        Row: {
          id: string
          name: string
          logo_url: string
          website_url: string | null
          category: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url: string
          website_url?: string | null
          category: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string
          website_url?: string | null
          category?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          id: string
          inviter_id: string
          invitee_email: string
          role: string
          status: string
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          inviter_id: string
          invitee_email: string
          role: string
          status?: string
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          inviter_id?: string
          invitee_email?: string
          role?: string
          status?: string
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          created_at: string
          action_url: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          read?: boolean
          created_at?: string
          action_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          created_at?: string
          action_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          event_name: string
          event_data: Json | null
          user_agent: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_name: string
          event_data?: Json | null
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_name?: string
          event_data?: Json | null
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      app_config: {
        Row: {
          id: string
          key: string
          value: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      patrocinadores: {
        Row: {
          id: string
          nome: string
          empresa: string
          categoria: string
          telefone: string
          email: string
          promessa: string
          observacoes: string | null
          logomarca_url: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          empresa: string
          categoria: string
          telefone: string
          email: string
          promessa: string
          observacoes?: string | null
          logomarca_url?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          empresa?: string
          categoria?: string
          telefone?: string
          email?: string
          promessa?: string
          observacoes?: string | null
          logomarca_url?: string | null
          status?: string
          created_at?: string
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

// ============================================================================
// TIPOS DERIVADOS PARA FACILITAR USO
// ============================================================================

// Tipos de tabelas principais
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type UserGamification = Database['public']['Tables']['user_gamification']['Row']
export type UserGamificationInsert = Database['public']['Tables']['user_gamification']['Insert']
export type UserGamificationUpdate = Database['public']['Tables']['user_gamification']['Update']

export type GamificationAction = Database['public']['Tables']['gamification_actions']['Row']
export type GamificationActionInsert = Database['public']['Tables']['gamification_actions']['Insert']
export type GamificationActionUpdate = Database['public']['Tables']['gamification_actions']['Update']

export type Payment = Database['public']['Tables']['payments']['Row']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']

export type Event = Database['public']['Tables']['events']['Row']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type EventUpdate = Database['public']['Tables']['events']['Update']

export type Registration = Database['public']['Tables']['registrations']['Row']
export type RegistrationInsert = Database['public']['Tables']['registrations']['Insert']
export type RegistrationUpdate = Database['public']['Tables']['registrations']['Update']

export type Sponsor = Database['public']['Tables']['sponsors']['Row']
export type SponsorInsert = Database['public']['Tables']['sponsors']['Insert']
export type SponsorUpdate = Database['public']['Tables']['sponsors']['Update']

export type Invite = Database['public']['Tables']['invites']['Row']
export type InviteInsert = Database['public']['Tables']['invites']['Insert']
export type InviteUpdate = Database['public']['Tables']['invites']['Update']

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row']
export type AnalyticsEventInsert = Database['public']['Tables']['analytics_events']['Insert']
export type AnalyticsEventUpdate = Database['public']['Tables']['analytics_events']['Update']

export type AppConfig = Database['public']['Tables']['app_config']['Row']
export type AppConfigInsert = Database['public']['Tables']['app_config']['Insert']
export type AppConfigUpdate = Database['public']['Tables']['app_config']['Update']

export type Patrocinador = Database['public']['Tables']['patrocinadores']['Row']
export type PatrocinadorInsert = Database['public']['Tables']['patrocinadores']['Insert']
export type PatrocinadorUpdate = Database['public']['Tables']['patrocinadores']['Update']

// ============================================================================
// TIPOS DE RESPOSTA PARA FUNÇÕES
// ============================================================================

export interface SupabaseResponse<T> {
  data: T | null
  error: any | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}

// ============================================================================
// TIPOS DE FILTROS
// ============================================================================

export interface UserFilters {
  role?: string
  is_active?: boolean
  profile_complete?: boolean
  limit?: number
  offset?: number
}

export interface EventFilters {
  status?: string
  limit?: number
  offset?: number
}

export interface SponsorFilters {
  category?: string
  status?: string
  limit?: number
  offset?: number
}

// ============================================================================
// TIPOS DE ORDENAÇÃO
// ============================================================================

export type SortOrder = 'asc' | 'desc'

export interface SortConfig {
  field: string
  order: SortOrder
}

// ============================================================================
// TIPOS DE RELACIONAMENTOS
// ============================================================================

export interface UserWithGamification extends User {
  gamification?: UserGamification
}

export interface UserWithPayments extends User {
  payments?: Payment[]
}

export interface UserWithRegistrations extends User {
  registrations?: Registration[]
}

export interface EventWithRegistrations extends Event {
  registrations?: Registration[]
}

export interface RegistrationWithUser extends Registration {
  user?: User
}

export interface RegistrationWithEvent extends Registration {
  event?: Event
}

export interface RegistrationWithUserAndEvent extends Registration {
  user?: User
  event?: Event
}
