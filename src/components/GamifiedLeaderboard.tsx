import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/clerk-react'
import { useGamificationContext  } from '../hooks/useGamificationContext' 
import { safeOpacityAnimation, safeSlideAnimation } from '../utils/animationUtils'
import { calculateGamificationLevel, GAMIFICATION_LEVEL_METADATA } from '../types'

interface GamifiedLeaderboardProps {
  showAnimations?: boolean
  maxUsers?: number
}

const sanitizeText = (text: string): string => text || 'Usuário Anônimo'

const getUserAvatar = (role?: string): string => {
  switch (role) {
    case 'atleta': return '/images/atleta-avatar.png'
    case 'judge': return '/images/judge-avatar.png'
    case 'staff': return '/images/staff-avatar.png'
    case 'espectador': return '/images/espectador-avatar.png'
    default: return '/images/default-avatar.png'
  }
}

const getLevelInfo = (tokens: number) => {
  const currentLevel = calculateGamificationLevel(tokens)
  const metadata = GAMIFICATION_LEVEL_METADATA[currentLevel]
  let nextLevelTokens = 0, progress = 0

  switch (currentLevel) {
    case 'cindy': nextLevelTokens = 100; progress = (tokens / 100) * 100; break
    case 'helen': nextLevelTokens = 300; progress = ((tokens - 100) / 200) * 100; break
    case 'fran': nextLevelTokens = 600; progress = ((tokens - 300) / 300) * 100; break
    case 'annie': nextLevelTokens = 1000; progress = ((tokens - 600) / 400) * 100; break
    case 'murph': nextLevelTokens = 2000; progress = ((tokens - 1000) / 1000) * 100; break
    case 'matt': nextLevelTokens = Infinity; progress = 100; break
  }

  return {
    currentLevel,
    metadata,
    nextLevelTokens,
    progress: Math.min(progress, 100),
    isMaxLevel: currentLevel === 'matt'
  }
}

export default function GamifiedLeaderboard({ showAnimations = true, maxUsers = 3 }: GamifiedLeaderboardProps) {
  const { leaderboard: allUsers, loading, error } = useGamificationContext()
  const { user: clerkUser } = useUser()

  // Se não há usuário logado, não renderizar nada
  if (!clerkUser) {
    return null;
  }

  const usersWithTokens = allUsers
    .filter((user) => (user.boxTokens || 0) > 0)
    .sort((a, b) => (b.boxTokens || 0) - (a.boxTokens || 0))

  const entries = maxUsers ? usersWithTokens.slice(0, maxUsers) : usersWithTokens

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `#${rank}`
    }
  }

  if (loading) {
    return <div className="animate-pulse text-gray-500">Carregando ranking...</div>
  }

  if (error) {
    return <p className="text-red-400 text-center">{error}</p>
  }

  return (
    <div className="bg-transparent">
      {/* Header iOS-like */}
      <motion.div 
        className="text-center mb-6" 
        {...safeOpacityAnimation(showAnimations, -20)}
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl mb-4 shadow-2xl">
          <span className="text-3xl">🏆</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Arena dos Consagrados
        </h2>
        <p className="text-gray-400 text-sm">
          {usersWithTokens.length} atletas competindo
        </p>
      </motion.div>

      {/* Cards iOS-like mobile-first */}
      <div className="space-y-3">
        <AnimatePresence>
          {entries.map((entry, index: number) => {
            const levelInfo = getLevelInfo(entry.boxTokens || 0)
            const isCurrentUser = clerkUser?.id === entry.id

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{
                  duration: 0.3,
                  delay: showAnimations ? index * 0.05 : 0,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className={`relative overflow-hidden rounded-3xl backdrop-blur-xl border shadow-2xl active:scale-98 transition-all duration-200 ${
                  isCurrentUser
                    ? 'bg-gradient-to-br from-pink-500/15 to-purple-600/15 border-pink-500/30'
                    : 'bg-white/8 border-white/15'
                }`}
                style={{
                  boxShadow: isCurrentUser 
                    ? '0 8px 32px rgba(236, 72, 153, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                {/* Current User Badge iOS-like */}
                {isCurrentUser && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [1, 0.9, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-2 -left-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg border border-white/20"
                  >
                    VOCÊ
                  </motion.div>
                )}

                <div className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Left side - Rank + Avatar + Info */}
                    <div className="flex items-center space-x-3 flex-1">
                      {/* Rank Badge iOS-like */}
                      <div className="relative">
                        <div 
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-lg ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                            index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                            'bg-gradient-to-br from-gray-600 to-gray-700'
                          }`}
                          style={{
                            boxShadow: index < 3 ? '0 4px 20px rgba(255, 215, 0, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.2)'
                          }}
                        >
                          {index < 3 ? getRankIcon(index + 1) : `#${index + 1}`}
                        </div>
                      </div>
                      
                      {/* Avatar + Info */}
                      <div className="flex items-center space-x-3 flex-1">
                        {/* Avatar iOS-like */}
                        <div className="relative">
                          <img
                            src={getUserAvatar(entry.role)}
                            alt={sanitizeText(entry.displayName || 'Usuário')}
                            className="w-14 h-14 rounded-2xl border-2 border-white/20 shadow-lg"
                          />
                          {/* Online indicator */}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-black"></div>
                          {/* Level badge */}
                          <div className="absolute -top-1 -right-1">
                            <img
                              src={levelInfo.metadata.icon as string}
                              alt={`Nível ${levelInfo.metadata.name}`}
                              className="w-6 h-6 rounded-full"
                            />
                          </div>
                        </div>
                        
                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {sanitizeText(entry.displayName || 'Usuário')}
                          </h3>
                          <p className="text-gray-400 text-sm truncate">
                            {entry.role || 'Geral'}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse"></div>
                            <span className="text-pink-400 font-medium text-sm">
                              {entry.boxTokens || 0} $BØX
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Score iOS-like */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-pink-400 mb-1">
                        {(entry.boxTokens || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 font-medium">$BØX</div>
                    </div>
                  </div>

                  {/* Progress Bar iOS-like */}
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-400 font-medium">Progresso</span>
                      <span className="text-xs text-gray-400 font-medium">
                        {entry.boxTokens || 0}/{levelInfo.nextLevelTokens}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${levelInfo.progress}%` }}
                        transition={{ 
                          delay: showAnimations ? index * 0.05 + 0.3 : 0.3, 
                          duration: 0.6,
                          ease: "easeOut"
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
                        style={{
                          boxShadow: '0 0 10px rgba(236, 72, 153, 0.5)'
                        }}
                      />
                    </div>
                    {!levelInfo.isMaxLevel && (
                      <p className="text-xs text-gray-400 mt-1">
                        {levelInfo.nextLevelTokens - (entry.boxTokens || 0)} $BØX para próximo nível
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State iOS-like */}
      {entries.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🏃‍♀️</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Nenhum atleta ainda
          </h3>
          <p className="text-gray-400 text-sm">
            Seja o primeiro a participar!
          </p>
        </div>
      )}

      {/* Footer iOS-like */}
      {entries.length > 0 && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/5 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-400 font-medium">
              Atualizado agora
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
