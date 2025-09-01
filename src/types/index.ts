// ============================================================================
// TIPOS BASE E ENUMS - ADAPTADOS PARA SUPABASE
// ============================================================================

// Re-exportar tipos de gamificação
export * from './gamification';

// Tipos de usuário
export type UserRole = 
  | 'publico' 
  | 'atleta' 
  | 'judge' 
  | 'midia' 
  | 'admin' 
  | 'dev' 
  | 'staff'
  | 'marketing'
  | 'fotografo'
  | 'espectador';

// Status de pagamento
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'expired';

// Status de aprovação
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

// Status de convite
export type ConviteStatus = 'pendente' | 'aceito' | 'recusado' | 'cancelado' | 'expirado';

// Tipos de audiovisual
export type AudiovisualTipo = 'fotografo' | 'videomaker' | 'jornalista' | 'influencer' | 'youtuber' | 'outro';

// Categorias de competição
export type CategoriaCompeticao = 'Scale' | 'RX' | 'Master 145+' | 'Amador';

// Lotes de inscrição
export type LoteInscricao = 'pre_venda' | 'primeiro' | 'segundo' | 'terceiro' | 'quarto' | 'quinto';

// Tipos de upsell
export type UpsellTipo = 'camiseta_extra' | 'kit_premium' | 'acesso_vip' | 'foto_profissional' | 'video_highlights' | 'recovery';

// Categorias de patrocinador
export type CategoriaPatrocinador = 'Ouro' | 'Prata' | 'Bronze' | 'Apoio';

// Status de patrocinador
export type StatusPatrocinador = 'ativo' | 'pendente' | 'inativo' | 'cancelado';

// ============================================================================
// GAMIFICAÇÃO - TIPOS E ENUMS
// ============================================================================

// 🎯 GAMIFICAÇÃO CAMADA 1 - Tipos de ação que geram tokens $BOX
export type GamificationAction =
  | 'cadastro'           // +10 $BOX
  | 'indicacao_confirmada' // +50 $BOX
  | 'compra_ingresso'    // +100 $BOX
  | 'envio_conteudo'     // +75 $BOX
  | 'qr_scan_evento'     // +25 $BOX (variável)
  | 'prova_extra'        // +50 $BOX (variável)
  | 'participacao_enquete' // +15 $BOX
  | 'acesso_spoiler'     // +20 $BOX
  | 'checkin_evento'     // +30 $BOX
  | 'compartilhamento'   // +10 $BOX
  | 'login_diario'       // +5 $BOX
  | 'completar_perfil'   // +25 $BOX;

// 🏋️‍♂️ NÍVEIS DE GAMIFICAÇÃO BASEADOS NOS WODs ICÔNICOS
export type GamificationLevel =
  | 'cindy'        // 0-99 $BOX - A Base
  | 'helen'        // 100-299 $BOX - O Fôlego
  | 'fran'         // 300-599 $BOX - O Inferno Curto
  | 'annie'        // 600-999 $BOX - A Coordenação
  | 'murph'        // 1000-1999 $BOX - A Prova Final
  | 'matt';        // 2000+ $BOX - O Escolhido

// 🎨 METADADOS VISUAIS DOS NÍVEIS
export interface GamificationLevelMetadata {
  name: string;
  icon: string;
  color: string;
  texture: string;
  description: string;
  achievement: string;
}

export const GAMIFICATION_LEVEL_METADATA: Record<GamificationLevel, GamificationLevelMetadata> = {
  cindy: {
    name: 'Cindy',
    icon: '/images/levels/cindy.webp',
    color: '#9CA3AF',
    texture: 'Leve névoa, base de concreto',
    description: 'Pegada/Passo inicial - A Base',
    achievement: 'primeiro_cadastro'
  },
  helen: {
    name: 'Helen',
    icon: '/images/levels/helen.webp',
    color: '#3B82F6',
    texture: 'Traços de movimento ao redor',
    description: 'Vento/Cardio - O Fôlego',
    achievement: 'helen_conquistada'
  },
  fran: {
    name: 'Fran',
    icon: '/images/levels/fran.webp',
    color: '#EF4444',
    texture: 'Chamas intensas',
    description: 'Inferno Curto - A Intensidade',
    achievement: 'fran_conquistada'
  },
  annie: {
    name: 'Annie',
    icon: '/images/levels/annie.webp',
    color: '#8B5CF6',
    texture: 'Energia elétrica',
    description: 'Coordenação - A Precisão',
    achievement: 'annie_conquistada'
  },
  murph: {
    name: 'Murph',
    icon: '/images/levels/murph.webp',
    color: '#F59E0B',
    texture: 'Metal brilhante',
    description: 'Prova Final - A Resistência',
    achievement: 'murph_conquistada'
  },
  matt: {
    name: 'Matt',
    icon: '/images/levels/matt.webp',
    color: '#10B981',
    texture: 'Cristal translúcido',
    description: 'O Escolhido - A Maestria',
    achievement: 'matt_conquistada'
  }
};

// ============================================================================
// TIPOS DE USUÁRIO - ADAPTADOS PARA SUPABASE
// ============================================================================

// Usuário base (compatível com Clerk + Supabase)
export interface User {
  id: string;
  clerk_id: string; // ID do Clerk
  email: string;
  display_name?: string;
  photo_url?: string;
  role: UserRole;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  box?: string;
  cidade?: string;
  is_active: boolean;
  profile_complete: boolean;
  test_user: boolean;
}

// Usuário com gamificação
export interface UserWithGamification extends User {
  gamification: {
    tokens: {
      box: {
        balance: number;
        total_earned: number;
        total_spent: number;
      };
      level: GamificationLevel;
      actions: GamificationAction[];
    };
    achievements: string[];
    last_daily_login?: string;
  };
}

// ============================================================================
// TIPOS DE PAGAMENTO
// ============================================================================

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string;
  correlation_id: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// TIPOS DE EVENTO
// ============================================================================

export interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  max_participants: number;
  current_participants: number;
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TIPOS DE INSCRIÇÃO
// ============================================================================

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  category: CategoriaCompeticao;
  lot: LoteInscricao;
  status: ApprovalStatus;
  payment_id?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TIPOS DE PATROCINADOR
// ============================================================================

export interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  category: CategoriaPatrocinador;
  status: StatusPatrocinador;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TIPOS DE CONVITE
// ============================================================================

export interface Invite {
  id: string;
  inviter_id: string;
  invitee_email: string;
  role: UserRole;
  status: ConviteStatus;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TIPOS DE NOTIFICAÇÃO
// ============================================================================

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  action_url?: string;
}

// ============================================================================
// TIPOS DE ANALYTICS
// ============================================================================

export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  event_name: string;
  event_data?: Record<string, unknown>;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
}

// ============================================================================
// TIPOS DE CONFIGURAÇÃO
// ============================================================================

export interface AppConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// TIPOS DE BACKUP E LEGACY
// ============================================================================

// Interface para compatibilidade com dados legados do Firestore
export interface LegacyFirestoreData {
  [key: string]: unknown;
}

// Função helper para converter dados legados
export function convertLegacyData<T>(legacyData: LegacyFirestoreData): T {
  // Implementar conversão de dados legados se necessário
  return legacyData as T;
}
