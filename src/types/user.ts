import type { Database } from './supabase'

// Tipos baseados no Database
export type SupabaseUser = Database['public']['Tables']['users']['Row']
export type UserGamification = Database['public']['Tables']['user_gamification']['Row']

export interface UserData extends SupabaseUser {
    clerkUserId: string // Alias pra clarity
    firstName?: string
    lastName?: string
    fullName?: string
    avatarUrl?: string
    gamification?: UserGamification
}