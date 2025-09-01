// 🚀 INTERBØX 2025 - Informações de Versão
// Gerado automaticamente em: 23/08/2025, 23:15:09
// Não editar manualmente!

export const BUILD_INFO = {
  version: '1.0.1-beta',
  buildDate: '23/08/2025, 23:15:09',
  buildId: '1756001709807-04fdfbf',
  gitHash: '04fdfbf0c72b4dfc25e02147302426f149977a02',
  gitBranch: 'main',
  gitMessage: '✨ Refatoração completa UserHeader + hooks de notificações e analytics  - Novo componente UserHeader.',
  timestamp: '2025-08-24T02:15:09.836Z',
  isProduction: false,
  environment: 'development'
};

export const APP_VERSION = '1.0.1-beta';
export const BUILD_ID = '1756001709807-04fdfbf';
export const GIT_HASH = '04fdfbf0c72b4dfc25e02147302426f149977a02';

export async function checkForUpdates(): Promise<boolean> {
  // Verificar se há nova versão disponível
  const currentVersion = localStorage.getItem('interbox_app_version');
  const currentBuildId = localStorage.getItem('interbox_build_id');
  
  if (!currentVersion || !currentBuildId) {
    // Primeira execução
    localStorage.setItem('interbox_app_version', BUILD_INFO.version);
    localStorage.setItem('interbox_build_id', BUILD_INFO.buildId);
    return false;
  }
  
  // Verificar se a versão mudou
  const hasUpdate = currentVersion !== BUILD_INFO.version || currentBuildId !== BUILD_INFO.buildId;
  
  if (hasUpdate) {
    // Atualizar versão local
    localStorage.setItem('interbox_app_version', BUILD_INFO.version);
    localStorage.setItem('interbox_build_id', BUILD_INFO.buildId);
  }
  
  return hasUpdate;
}

export function getVersionDisplay(): string {
  return `v${BUILD_INFO.version} (${BUILD_INFO.buildDate})${BUILD_INFO.version.includes('beta') ? ' - BETA' : ''}`;
}

export default BUILD_INFO;
