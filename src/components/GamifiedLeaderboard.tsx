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
      <motion.div className="text-center mb-8" {...safeOpacityAnimation(showAnimations, -20)}>
        <h2 className="text-3xl font-black text-white mb-3">🏆 Ranking $BØX</h2>
        <p className="text-lg text-gray-200 font-medium">
          ARENA DOS CONSAGRADOS • {usersWithTokens.length} Atletas com $BOX
        </p>
      </motion.div>

      <div className="space-y-6">
        <AnimatePresence>
          {entries.map((entry, index: number) => {
            const levelInfo = getLevelInfo(entry.boxTokens || 0)
            const isCurrentUser = clerkUser?.id === entry.id

            return (
              <motion.div
                key={entry.id}
                {...safeSlideAnimation(showAnimations, -20)}
                transition={{
                  duration: 0.4,
                  delay: showAnimations ? index * 0.2 : 0,
                }}
                className={`relative overflow-hidden rounded-2xl backdrop-blur-lg ${
                  isCurrentUser
                    ? 'bg-gradient-to-br from-pink-500/20 to-purple-600/20 border-2 border-pink-500/50 shadow-xl'
                    : 'bg-white/10 border border-white/20'
                }`}
              >
                {isCurrentUser && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [1, 0.95, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-3 -left-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm px-4 py-2 rounded-full font-bold shadow-lg border border-white/20"
                  >
                    VOCÊ
                  </motion.div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl font-black">{getRankIcon(index + 1)}</span>
                      <div className="relative">
                        <img
                          src={getUserAvatar(entry.role)}
                          alt={sanitizeText(entry.displayName || 'Usuário')}
                          width={56}
                          height={56}
                          className="rounded-full border-4 shadow-xl"
                        />
                        <div className="absolute -top-2 -right-2">
                          <img
                            src={levelInfo.metadata.icon as string}
                            alt={`Nível ${levelInfo.metadata.name}`}
                            className="w-8 h-8 object-cover rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="text-right"
                    >
                      <div className="font-black text-2xl mb-1 text-pink-400">
                        {(entry.boxTokens || 0).toLocaleString()}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <img
                          src="/logos/BOX.png"
                          alt="$BOX Token"
                          className="w-8 h-8 object-cover rounded-full"
                        />
                      </div>
                    </motion.div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white">{sanitizeText(entry.displayName || 'Usuário')}</h3>
                    <p className="text-gray-300 text-base font-medium">
                      Está participando como: {entry.role || 'Geral'}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div />
                        <div className="text-right">
                          <div className="text-gray-300 text-sm font-medium">Ranking</div>
                          <div className="text-white font-bold text-lg">#{index + 1}</div>
                        </div>
                      </div>

                      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${levelInfo.progress}%` }}
                          transition={{ duration: 1.2, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
                        />
                      </div>
                      {!levelInfo.isMaxLevel && (
                        <p className="text-xs text-gray-400 mt-1">
                          {entry.boxTokens}/{levelInfo.nextLevelTokens} $BOX para próximo nível
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
