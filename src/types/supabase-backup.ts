// ============================================================================
// TIPOS SUPABASE - INTERBØX V2
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole = 
  | 'publico'
  | 'atleta' 
  | 'judge'
  | 'midia'
  | 'espectador'
  | 'admin'
  | 'dev'
  | 'marketing'
  | 'staff'

export type UserStatus = 
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'pending'

export type GamificationLevel = 
  | 'annie'    // Iniciante
  | 'cindy'    // Base
  | 'fran'     // Intermediário
  | 'helen'    // Avançado
  | 'matt'     // Expert
  | 'murph'    // Master

export type TransactionType = 
  | 'earn'
  | 'spend'
  | 'bonus'
  | 'referral'
  | 'achievement'

export type SponsorStatus = 
  | 'bronze'
  | 'prata'
  | 'ouro'
  | 'platina'
  | 'pending'
  | 'rejected'

// ============================================================================
// INTERFACES PRINCIPAIS
// ============================================================================

export interface User {
  id: string
  clerk_id: string
  email: string
  display_name: string
  photo_url?: string
  role: UserRole
  whatsapp?: string
  box?: string
  cidade?: string
  mensagem?: string
  profile_complete: boolean
  is_active: boolean
  test_user: boolean
  status: UserStatus
  team_id?: string
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  nome: string
  captain_id?: string
  atletas: Json
  created_at: string
  updated_at: string
}

export interface UserGamification {
  id: string
  user_id: string
  level: GamificationLevel
  box_tokens: number
  total_earned: number
  total_spent: number
  weekly_tokens: number
  monthly_tokens: number
  yearly_tokens: number
  referral_tokens: number
  achievements: string[]
  badges: string[]
  challenges: Json
  rewards: Json
  referral_code: string
  referrals: string[]
  total_actions: number
  frequencia_dias: number
  melhor_frequencia: number
  last_action_at: string
  ultimo_login_frequencia: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  description?: string
  metadata: Json
  created_at: string
}

export interface Patrocinador {
  id: string
  nome: string
  empresa: string
  categoria: string
  telefone: string
  email: string
  promessa?: string
  observacoes?: string
  logomarca_url?: string
  status: SponsorStatus
  created_at: string
  updated_at: string
}

export interface AnalyticsEvent {
  id: string
  user_id?: string
  event_name: string
  event_data: Json
  user_agent?: string
  ip_address?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  metadata: Json
  created_at: string
}

export interface TeamInvite {
  id: string
  team_id: string
  inviter_id: string
  invitee_email: string
  invitee_id?: string
  status: string
  expires_at: string
  created_at: string
}

// ============================================================================
// TIPOS PARA INSERÇÃO E ATUALIZAÇÃO
// ============================================================================

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>
export type UserUpdate = Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>

export type TeamInsert = Omit<Team, 'id' | 'created_at' | 'updated_at'>
export type TeamUpdate = Partial<Omit<Team, 'id' | 'created_at' | 'updated_at'>>

export type UserGamificationInsert = Omit<UserGamification, 'id' | 'created_at' | 'updated_at'>
export type UserGamificationUpdate = Partial<Omit<UserGamification, 'id' | 'created_at' | 'updated_at'>>

export type TransactionInsert = Omit<Transaction, 'id' | 'created_at'>
export type TransactionUpdate = Partial<Omit<Transaction, 'id' | 'created_at'>>

export type PatrocinadorInsert = Omit<Patrocinador, 'id' | 'created_at' | 'updated_at'>
export type PatrocinadorUpdate = Partial<Omit<Patrocinador, 'id' | 'created_at' | 'updated_at'>>

export type AnalyticsEventInsert = Omit<AnalyticsEvent, 'id' | 'created_at'>
export type AnalyticsEventUpdate = Partial<Omit<AnalyticsEvent, 'id' | 'created_at'>>

export type NotificationInsert = Omit<Notification, 'id' | 'created_at'>
export type NotificationUpdate = Partial<Omit<Notification, 'id' | 'created_at'>>

export type TeamInviteInsert = Omit<TeamInvite, 'id' | 'created_at'>
export type TeamInviteUpdate = Partial<Omit<TeamInvite, 'id' | 'created_at'>>

// ============================================================================
// INTERFACE PRINCIPAL DO DATABASE
// ============================================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
      }
      teams: {
        Row: Team
        Insert: TeamInsert
        Update: TeamUpdate
      }
      user_gamification: {
        Row: UserGamification
        Insert: UserGamificationInsert
        Update: UserGamificationUpdate
      }
      transactions: {
        Row: Transaction
        Insert: TransactionInsert
        Update: TransactionUpdate
      }
      patrocinadores: {
        Row: Patrocinador
        Insert: PatrocinadorInsert
        Update: PatrocinadorUpdate
      }
      analytics_events: {
        Row: AnalyticsEvent
        Insert: AnalyticsEventInsert
        Update: AnalyticsEventUpdate
      }
      notifications: {
        Row: Notification
        Insert: NotificationInsert
        Update: NotificationUpdate
      }
      team_invites: {
        Row: TeamInvite
        Insert: TeamInviteInsert
        Update: TeamInviteUpdate
      }
    }
    Views: Record<string, never>
    Functions: {
      create_user_with_gamification: {
            Args: {
              p_clerk_id: string
              p_email: string
              p_display_name: string
              p_role?: UserRole
            }
            Returns: string
          }
      add_tokens: {
            Args: {
              p_user_id: string
              p_amount: number
              p_type?: TransactionType
              p_description?: string
            }
            Returns: boolean
          }
    }
    Enums: {
      user_role: UserRole
      user_status: UserStatus
      gamification_level: GamificationLevel
      transaction_type: TransactionType
      sponsor_status: SponsorStatus
    }
    CompositeTypes: Record<string, never>
  }
}

// ============================================================================
// TIPOS DE NEGÓCIO
// ============================================================================

// UserRole já definido acima

