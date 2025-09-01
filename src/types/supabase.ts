// Tipos básicos para o Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Tipos básicos para as tabelas principais
export interface User {
  id: string;
  clerk_id: string;
  email: string;
  display_name: string;
  photo_url: string;
  role: string;
  whatsapp: string;
  box: string;
  cidade: string;
  mensagem: string;
  profile_complete: boolean;
  is_active: boolean;
  test_user: boolean;
  created_at: string;
  updated_at: string;
  team_id?: string;
}

export interface CompetitionTeam {
  id: string;
  atleta_id: string;
  nome: string;
  criado_em: string;
  captain_id?: string;
}

export interface UserGamification {
  id: string;
  user_id: string;
  box_tokens: number;
  total_earned: number;
  achievements: string[];
  last_action: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_name: string;
  event_data: boolean;
  user_agent: string;
  ip_address: string;
}

export interface Patrocinador {
  id: string;
  nome: string;
  empresa: string;
  categoria: string;
  telefone: string;
  email: string;
  promessa: string;
  observacoes: string;
  logomarca_url: string;
  status: string;
  created_at: string;
}

// Interface principal do Database para compatibilidade
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      competition_teams: {
        Row: CompetitionTeam;
        Insert: Omit<CompetitionTeam, 'id'>;
        Update: Partial<Omit<CompetitionTeam, 'id'>>;
      };
      user_gamification: {
        Row: UserGamification;
        Insert: Omit<UserGamification, 'id'>;
        Update: Partial<Omit<UserGamification, 'id'>>;
      };
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: Omit<AnalyticsEvent, 'id'>;
        Update: Partial<Omit<AnalyticsEvent, 'id'>>;
      };
      patrocinadores: {
        Row: Patrocinador;
        Insert: Omit<Patrocinador, 'id' | 'created_at'>;
        Update: Partial<Omit<Patrocinador, 'id' | 'created_at'>>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

