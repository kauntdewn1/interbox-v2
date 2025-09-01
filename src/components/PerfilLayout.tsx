import { MoreHorizontal, Settings } from 'lucide-react'
import { GAMIFICATION_LEVEL_METADATA } from '../types/gamification'

interface PerfilLayoutProps {
  tipo: string
  nome: string
  avatar?: string
  saldoBox?: number
  nivel?: string
  onSettings?: () => void
  onMore?: () => void
  children: React.ReactNode
}

export function PerfilLayout({ 
  tipo, 
  nome, 
  avatar, 
  saldoBox = 0,
  nivel = 'cindy',
  onSettings, 
  onMore, 
  children 
}: PerfilLayoutProps) {
  // Handler para clique no avatar - redireciona para ProfileSettings
  const handleAvatarClick = () => {
    if (onSettings) {
      onSettings() // Abre o ProfileSettings onde o usuário pode escolher avatar
    }
  }

  // 🏆 Sistema de Badges baseado no GamifiedLeaderboard.tsx
  const getNivelInfo = (nivel: string) => {
    const metadata = GAMIFICATION_LEVEL_METADATA[nivel as keyof typeof GAMIFICATION_LEVEL_METADATA] || GAMIFICATION_LEVEL_METADATA.cindy
    
    // 🎨 Converter cores hex para gradientes Tailwind
    const getGradientFromColor = (color: string) => {
      switch (color) {
        case '#9CA3AF': return 'from-gray-400 to-gray-500' // Cindy
        case '#3B82F6': return 'from-blue-500 to-blue-600' // Helen
        case '#DC2626': return 'from-red-500 to-red-600'   // Fran
        case '#8B5CF6': return 'from-purple-500 to-purple-600' // Annie
        case '#1F2937': return 'from-gray-700 to-gray-800' // Murph
        case '#F59E0B': return 'from-yellow-500 to-orange-500' // Matt
        default: return 'from-blue-500 to-cyan-500'
      }
    }
    
    return {
      nome: metadata.name,
      cor: getGradientFromColor(metadata.color),
      icon: metadata.icon,
      description: metadata.description
    }
  }

  const nivelInfo = getNivelInfo(nivel)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* 🍎 Header iOS Style - Espaçoso e Elegante */}
      <header className="px-6 pt-12 pb-4">
        <div className="flex items-center justify-between mb-6">
          {/* Botão Voltar - iOS Style */}
          <button 
            onClick={() => window.history.back()}
            className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Logo INTERBØX - iOS Style com Espaçamento */}
          <div className="flex-1 text-center px-8">
            <div className="flex items-center justify-center">
              <img 
                src="/logos/login_hrz.png" 
                alt="INTERBØX" 
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>

          {/* Botões da Direita - iOS Style com Touch Targets Adequados */}
          <div className="flex items-center space-x-3">
            {/* Avatar do Perfil - Clique para abrir configurações */}
            <button
              onClick={handleAvatarClick}
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all duration-200 relative group"
            >
              {avatar ? (
                <img 
                  src={avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {nome.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Overlay indicando que é clicável */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
            </button>

            {/* Botão Configurações */}
            <button
              onClick={onSettings}
              className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>

            {/* Botão Mais Opções */}
            <button
              onClick={onMore}
              className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200"
            >
              <MoreHorizontal className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* 🎯 Hero Section - Saldo e Nível com Badges (SEM RANKING) */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            {/* Informações do Usuário */}
            <div className="flex items-center space-x-4">
              {/* Avatar Grande - Clique para configurações */}
              <button
                onClick={handleAvatarClick}
                className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/20 hover:border-white/40 transition-all duration-200 relative group"
              >
                {avatar ? (
                  <img 
                    src={avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-white font-bold text-2xl">
                    {nome.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Overlay indicando configurações */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
              </button>
              
              {/* Nome e Tipo */}
              <div>
                <h2 className="text-xl font-bold">{nome}</h2>
                <p className="text-blue-100 text-sm">{tipo}</p>
                {!avatar && (
                  <p className="text-blue-200 text-xs mt-1 opacity-80">
                    🎭 Clique para escolher avatar
                  </p>
                )}
              </div>
            </div>

            {/* Saldo $BØX */}
            <div className="text-right">
              <div className="text-3xl font-bold">{saldoBox}</div>
              <div className="text-blue-100 text-sm">$BØX</div>
            </div>
          </div>
          
          {/* 🏆 Nível com Badge (SEM RANKING) */}
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
              <span className="text-sm text-blue-100 font-medium">Seu Nível:</span>
              <div className="flex items-center space-x-3">
                {/* Badge do Nível com Imagem */}
                <div className="relative">
                  <img
                    src={nivelInfo.icon}
                    alt={`Nível ${nivelInfo.nome}`}
                    className="w-8 h-8 object-cover rounded-full shadow-lg"
                  />
                </div>
                {/* Nome do Nível */}
                <div className={`bg-gradient-to-r ${nivelInfo.cor} px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg`}>
                  <span className="font-semibold text-white">{nivelInfo.nome}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal com Padding iOS */}
      <main className="px-6 pb-8">
        {children}
      </main>
    </div>
  )
}
