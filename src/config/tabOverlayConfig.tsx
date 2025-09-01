// ============================================================================
// CONFIGURAÇÃO DAS ABAS COM OVERLAY "EM BREVE"
// ============================================================================

export interface TabOverlayConfig {
    isActive: boolean
    title: string
    description: string
    icon: string
  }
  
  export interface ProfileTabOverlays {
    [tabId: string]: TabOverlayConfig
  }
  
  export interface AllProfileOverlays {
    [profileType: string]: ProfileTabOverlays
  }
  
  // Configuração centralizada de todas as abas com overlay
  export const TAB_OVERLAY_CONFIG: AllProfileOverlays = {
    PerfilAtleta: {
      competicao: {
        isActive: true,
        title: "Dados de Competição",
        description: "As estatísticas e resultados da competição estarão disponíveis em breve",
        icon: "🏆"
      },
      time: {
        isActive: true,
        title: "Meu Time",
        description: "As funcionalidades completas do time estarão disponíveis em breve",
        icon: "👥"
      },
      eventos: {
        isActive: true,
        title: "Histórico de Eventos",
        description: "O histórico completo de eventos estará disponível em breve",
        icon: "📅"
      },
      convites: {
        isActive: true,
        title: "Sistema de Convites",
        description: "O sistema completo de convites estará disponível em breve",
        icon: "📨"
      }
    },
    
    PerfilJudge: {
      convites: {
        isActive: true,
        title: "Sistema de Convites",
        description: "O sistema completo de convites para juízes estará disponível em breve",
        icon: "📧"
      },
      julgamento: {
        isActive: true,
        title: "Sistema de Julgamento",
        description: "O sistema completo de julgamento estará disponível em breve",
        icon: "⚖️"
      }
    },
    
    PerfilEspectador: {
      convites: {
        isActive: true,
        title: "Sistema de Convites",
        description: "O sistema completo de convites para espectadores estará disponível em breve",
        icon: "📧"
      }
    },
    
    PerfilMidia: {
      convites: {
        isActive: true,
        title: "Sistema de Convites",
        description: "O sistema completo de convites para mídia estará disponível em breve",
        icon: "📧"
      },
      conteudo: {
        isActive: true,
        title: "Upload de Conteúdo",
        description: "Esta funcionalidade estará disponível apenas no dia do evento",
        icon: "📸"
      }
    }
  }
  
  // Função helper para obter configuração de uma aba específica
  export function getTabOverlayConfig(profileType: string, tabId: string): TabOverlayConfig | null {
    return TAB_OVERLAY_CONFIG[profileType]?.[tabId] || null
  }
  
  // Função helper para verificar se uma aba deve ter overlay
  export function shouldShowTabOverlay(profileType: string, tabId: string): boolean {
    const config = getTabOverlayConfig(profileType, tabId)
    return config?.isActive || false
  }
  
  // Função helper para obter todas as abas com overlay de um perfil
  export function getProfileOverlays(profileType: string): ProfileTabOverlays {
    return TAB_OVERLAY_CONFIG[profileType] || {}
  }
  