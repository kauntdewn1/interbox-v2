import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Tipagem segura dos patrocinadores
interface Sponsor {
  id: string
  name: string
  logo_url: string
  website_url: string | null
  category: string
  status: boolean
  created_at: string
  updated_at: string
}

export default function PatrocinadoresDashboard() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)

  // 🔄 Fetch de patrocinadores ordenado por criação
  const fetchSponsors = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar patrocinadores:', error.message)
    } else {
      // Conversão segura de status para boolean
      const parsed = (data || []).map((item) => ({
        ...item,
        status:
  typeof item.status === 'boolean'
    ? item.status
    : typeof item.status === 'string'
    ? item.status === 'true'
    : typeof item.status === 'number'
    ? item.status === 1
    : false,
      }))
      setSponsors(parsed)
    }

    setLoading(false)
  }

  // 🗑️ Deletar patrocinador
  const deletarPatrocinador = async (id: string) => {
    const { error } = await supabase
      .from('sponsors')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar patrocinador:', error.message)
    } else {
      fetchSponsors()
    }
  }

  // ✅ Ativar/Inativar patrocinador
  const toggleStatus = async (id: string, novoStatus: boolean) => {
    const { error } = await supabase
  .from('sponsors')
  .update({ status: novoStatus.toString() }) // "true" ou "false"
  .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status:', error.message)
    } else {
      fetchSponsors()
    }
  }

  useEffect(() => {
    fetchSponsors()
  }, [])

  if (loading) {
    return <p className="text-gray-400">Carregando patrocinadores...</p>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">🏅 Patrocinadores</h2>

      {sponsors.length === 0 ? (
        <p className="text-gray-400">Nenhum patrocinador cadastrado.</p>
      ) : (
        sponsors.map((patrocinador) => (
          <div
            key={patrocinador.id}
            className="p-4 border border-white/10 rounded-xl bg-white/5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <img
                src={patrocinador.logo_url}
                alt={patrocinador.name}
                className="h-12 w-12 rounded"
              />
              <div>
                <p className="text-white font-semibold">{patrocinador.name}</p>
                <p className="text-xs text-gray-400">
                  Criado em{' '}
                  {new Date(patrocinador.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleStatus(patrocinador.id, !patrocinador.status)}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  patrocinador.status
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-white'
                }`}
              >
                {patrocinador.status ? 'Ativo' : 'Inativo'}
              </button>

              <button
                onClick={() => deletarPatrocinador(patrocinador.id)}
                className="text-red-400 hover:text-red-600 text-sm"
              >
                Remover
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
