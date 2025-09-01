import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@clerk/clerk-react'
import type { Database } from '@/types/supabase'

type UpdateUser = Database['public']['Tables']['users']['Update']

export default function ProfileSettings() {
  const { user: clerkUser, isLoaded } = useUser()
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState<{
    id: string
    clerk_id: string
    email: string
    display_name: string
    role: string
    photo_url: string
  }>({
    id: '',
    clerk_id: '',
    email: '',
    display_name: '',
    role: '',
    photo_url: ''
  })

  // Buscar dados do Supabase
  useEffect(() => {
    const fetchUser = async () => {
      if (!clerkUser || !isLoaded) return

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_id', clerkUser.id)
        .single()

      if (error) {
        console.error('Erro ao buscar dados do usuário:', error.message)
      } else if (data) {
        setForm({
          id: data.id ?? '',
          clerk_id: data.clerk_id ?? '',
          email: data.email ?? '',
          display_name: data.display_name ?? '',
          role: data.role ?? '',
          photo_url: data.photo_url ?? ''
        })
      }

      setLoading(false)
    }

    fetchUser()
  }, [clerkUser, isLoaded])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!clerkUser) return

    const updates: UpdateUser = {
      id: form.id,
      clerk_id: form.clerk_id,
      email: form.email,
      display_name: form.display_name,
      role: form.role,
      photo_url: form.photo_url,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('clerk_id', clerkUser.id)

    if (error) {
      console.error('Erro ao atualizar perfil:', error.message)
    } else {
      alert('Perfil atualizado com sucesso!')
    }
  }

  if (loading) {
    return <p className="text-gray-400">Carregando perfil...</p>
  }

  return (
    <div className="max-w-xl mx-auto bg-white/5 p-6 rounded-xl border border-white/10 shadow-md">
      <h2 className="text-xl font-bold text-white mb-4">⚙️ Configurações do Perfil</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-white block mb-1">Nome de Exibição</label>
          <input
            name="display_name"
            value={form.display_name}
            onChange={handleChange}
            className="w-full bg-black/40 border border-pink-500/30 text-white rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-white block mb-1">Foto (URL)</label>
          <input
            name="photo_url"
            value={form.photo_url}
            onChange={handleChange}
            className="w-full bg-black/40 border border-pink-500/30 text-white rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-white block mb-1">Função</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full bg-black/40 border border-pink-500/30 text-white rounded-lg px-4 py-2"
          >
            <option value="">Selecione uma função</option>
            <option value="atleta">Atleta</option>
            <option value="judge">Juiz</option>
            <option value="midia">Mídia</option>
            <option value="espectador">Espectador</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
            <option value="dev">Dev</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="mt-4 bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-2 rounded-lg transition-all"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  )
}
