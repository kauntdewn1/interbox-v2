// ============================================================================
// TIPOS SUPABASE TEMPORÁRIOS - INTERBØX V2
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

export type GamificationLevel = 
  | 'cindy'
  | 'helen'
  | 'fran'
  | 'annie'
  | 'murph'
  | 'matt'

export type TransactionType = 
  | 'earn'
  | 'spend'
  | 'transfer'
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

export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'

export type TeamInviteStatus = 
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired'

// ============================================================================
// INTERFACES PRINCIPAIS
// ============================================================================

export interface User {
  id: string
  clerk_id: string
  email: string
  display_name: string | null
  photo_url: string | null
  role: UserRole
  whatsapp?: string
  box?: string
  cidade?: string
  mensagem?: string
  profile_complete: boolean
  is_active: boolean
  test_user: boolean
  team_id?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface UserInsert {
  id?: string
  clerk_id: string
  email: string
  display_name?: string | null
  photo_url?: string | null
  role: UserRole
  whatsapp?: string
  box?: string
  cidade?: string
  mensagem?: string
  profile_complete?: boolean
  is_active?: boolean
  test_user?: boolean
  team_id?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export interface UserUpdate {
  id?: string
  clerk_id?: string
  email?: string
  display_name?: string | null
  photo_url?: string | null
  role?: UserRole
  whatsapp?: string
  box?: string
  cidade?: string
  mensagem?: string
  profile_complete?: boolean
  is_active?: boolean
  test_user?: boolean
  team_id?: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
}

export interface UserGamification {
  id: string
  user_id: string
  level: GamificationLevel
  box_tokens: number
  total_earned: number
  achievements: string[]
  badges: string[]
  last_action: string
  created_at: string
  updated_at: string
}

export interface UserGamificationInsert {
  id?: string
  user_id: string
  level?: GamificationLevel
  box_tokens?: number
  total_earned?: number
  achievements?: string[]
  badges?: string[]
  last_action?: string
  created_at?: string
  updated_at?: string
}

export interface UserGamificationUpdate {
  id?: string
  user_id?: string
  level?: GamificationLevel
  box_tokens?: number
  total_earned?: number
  achievements?: string[]
  badges?: string[]
  last_action?: string
  created_at?: string
  updated_at?: string
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: TransactionType
  description: string
  metadata?: Json
  created_at: string
}

export interface TransactionInsert {
  id?: string
  user_id: string
  amount: number
  type: TransactionType
  description: string
  metadata?: Json
  created_at?: string
}

export interface TransactionUpdate {
  id?: string
  user_id?: string
  amount?: number
  type?: TransactionType
  description?: string
  metadata?: Json
  created_at?: string
}

export interface Team {
  id: string
  nome: string
  categoria?: string
  status?: string
  captain_id: string
  members: string[]
  created_at: string
  updated_at: string
}

export interface TeamInsert {
  id?: string
  nome: string
  categoria?: string
  status?: string
  captain_id: string
  members?: string[]
  created_at?: string
  updated_at?: string
}

export interface TeamUpdate {
  id?: string
  nome?: string
  categoria?: string
  status?: string
  captain_id?: string
  members?: string[]
  created_at?: string
  updated_at?: string
}

export interface Patrocinador {
  id: string
  nome: string
  empresa: string
  categoria: string
  telefone: string
  email: string
  promessa: string
  observacoes?: string
  logomarca_url?: string
  status: SponsorStatus
  created_at: string
  updated_at: string
}

export interface PatrocinadorInsert {
  id?: string
  nome: string
  empresa: string
  categoria: string
  telefone: string
  email: string
  promessa: string
  observacoes?: string
  logomarca_url?: string
  status?: SponsorStatus
  created_at?: string
  updated_at?: string
}

export interface PatrocinadorUpdate {
  id?: string
  nome?: string
  empresa?: string
  categoria?: string
  telefone?: string
  email?: string
  promessa?: string
  observacoes?: string
  logomarca_url?: string
  status?: SponsorStatus
  created_at?: string
  updated_at?: string
}

export interface AnalyticsEvent {
  id: string
  user_id: string
  event_name: string
  event_data: Json
  user_agent: string
  ip_address?: string
  created_at: string
}

export interface AnalyticsEventInsert {
  id?: string
  user_id: string
  event_name: string
  event_data: Json
  user_agent: string
  ip_address?: string
  created_at?: string
}

export interface AnalyticsEventUpdate {
  id?: string
  user_id?: string
  event_name?: string
  event_data?: Json
  user_agent?: string
  ip_address?: string
  created_at?: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  metadata?: Json
  created_at: string
  updated_at: string
}

export interface NotificationInsert {
  id?: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  read?: boolean
  metadata?: Json
  created_at?: string
  updated_at?: string
}

export interface NotificationUpdate {
  id?: string
  user_id?: string
  title?: string
  message?: string
  type?: NotificationType
  read?: boolean
  metadata?: Json
  created_at?: string
  updated_at?: string
}

export interface TeamInvite {
  id: string
  team_id: string
  inviter_id: string
  invitee_email: string
  status: TeamInviteStatus
  expires_at: string
  created_at: string
  updated_at: string
}

export interface TeamInviteInsert {
  id?: string
  team_id: string
  inviter_id: string
  invitee_email: string
  status?: TeamInviteStatus
  expires_at: string
  created_at?: string
  updated_at?: string
}

export interface TeamInviteUpdate {
  id?: string
  team_id?: string
  inviter_id?: string
  invitee_email?: string
  status?: TeamInviteStatus
  expires_at?: string
  created_at?: string
  updated_at?: string
}

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
      add_tokens: {
        Args: {
          p_user_id: string
          p_amount: number
          p_type: TransactionType
          p_description: string
        }
        Returns: { success: boolean; new_balance: number }
      }
      create_user_with_gamification: {
        Args: {
          p_clerk_id: string
          p_email: string
          p_display_name: string
          p_role: UserRole
        }
        Returns: { user_id: string; gamification_id: string }
      }
    }
    Enums: {
      user_role: UserRole
      user_status: UserStatus
      gamification_level: GamificationLevel
      transaction_type: TransactionType
      sponsor_status: SponsorStatus
      notification_type: NotificationType
      team_invite_status: TeamInviteStatus
    }
  }
}
