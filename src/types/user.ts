import type { User as SupabaseUser, UserGamification } from './supabase'

export interface UserData extends SupabaseUser {
    clerkUserId: string // Alias pra clarity
    firstName?: string
    lastName?: string
    fullName?: string
    avatarUrl?: string
    gamification?: UserGamification
  }