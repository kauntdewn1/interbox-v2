import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { supabase } from '../lib/supabase'

// Tipos
interface ConsolidatedUser {
  id: string
  displayName: string
  role: 'atleta' | 'judge' | 'staff' | 'espectador' | 'desconhecido'
  boxTokens: number
}

interface UserRow {
  id: string
  display_name: string
  role: string
}

interface GamificationRow {
  user_id: string
  box_tokens: number
}

interface UseGamificationContextResult {
  leaderboard: ConsolidatedUser[]
  currentUser: ConsolidatedUser | null
  loading: boolean
  error: string | null
}

export function useGamificationContext(): UseGamificationContextResult {
  const { user: clerkUser } = useUser()
  const [leaderboard, setLeaderboard] = useState<ConsolidatedUser[]>([])
  const [currentUser, setCurrentUser] = useState<ConsolidatedUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1. Busca gamificação
        const { data: gamificationData, error: gamificationError } = await supabase
          .from('user_gamification')
          .select('user_id, box_tokens')
          .order('box_tokens', { ascending: false })

        if (gamificationError) throw gamificationError
        if (!Array.isArray(gamificationData)) throw new Error('Erro ao carregar gamificação')

        const userIds = gamificationData.map((row: Record<string, unknown>) => row.user_id as string)

        // 2. Busca usuários correspondentes
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, display_name, role')
          .in('id', userIds)

        if (usersError) throw usersError
        if (!Array.isArray(usersData)) throw new Error('Erro ao carregar usuários')

        const userMap = new Map<string, UserRow>()
        usersData.forEach((user: Record<string, unknown>) => {
          if (isUserRow(user)) {
            userMap.set(user.id as string, user as UserRow)
          }
        })

        // 3. Consolida os dados
        const consolidated: ConsolidatedUser[] = gamificationData
          .filter(isGamificationRow)
          .map((entry: GamificationRow) => {
            const profile = userMap.get(entry.user_id)
            return {
              id: entry.user_id,
              displayName: profile?.display_name ?? 'Anônimo',
              role: validateRole(profile?.role as string),
              boxTokens: entry.box_tokens ?? 0,
            }
          })

        setLeaderboard(consolidated)

        const current = consolidated.find(u => u.id === clerkUser?.id) ?? null
        setCurrentUser(current)
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('[useGamificationContext] Erro:', err.message)
          setError(err.message)
        } else {
          console.error('[useGamificationContext] Erro desconhecido:', err)
          setError('Erro desconhecido ao carregar dados')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [clerkUser?.id])

  return { leaderboard, currentUser, loading, error }
}

// --- Type Guards ---
function isUserRow(obj: unknown): obj is UserRow {
  return typeof obj === 'object' && obj !== null &&
    'id' in obj && typeof (obj as Record<string, unknown>).id === 'string' &&
    'display_name' in obj && typeof (obj as Record<string, unknown>).display_name === 'string' &&
    'role' in obj && typeof (obj as Record<string, unknown>).role === 'string'
}

function isGamificationRow(obj: unknown): obj is GamificationRow {
  return typeof obj === 'object' && obj !== null &&
    'user_id' in obj && typeof (obj as Record<string, unknown>).user_id === 'string' &&
    'box_tokens' in obj && typeof (obj as Record<string, unknown>).box_tokens === 'number'
}

function validateRole(role: string | undefined): ConsolidatedUser['role'] {
  const roles = ['atleta', 'judge', 'staff', 'espectador']
  return role && roles.includes(role) ? role as ConsolidatedUser['role'] : 'desconhecido'
}
