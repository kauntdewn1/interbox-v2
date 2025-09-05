import type { Database } from './supabase'

// Tipos baseados no Database
export type SupabaseUser = Database['public']['Tables']['users']['Row']
export type UserGamification = Database['public']['Tables']['user_gamification']['Row']

export interface UserData extends SupabaseUser {
    clerkUserId: string, // Alias pra clarity
    Name?: string,
    lastName?: string,
    fullName?: string,
    avatarUrl?: string,
    gamification?: UserGamification,
    boxTokens?: number,
    level?: string,
    achievements?: string[],
    badges?: string[],
    updated_at: string,
    created_at: string,
}