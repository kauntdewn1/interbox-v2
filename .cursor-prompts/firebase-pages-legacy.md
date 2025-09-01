# 🧠 CONTEXTO

Este projeto usa atualmente:
- 🔐 Clerk para autenticação
- 🧾 Supabase como banco de dados
- ⚛️ React + Vite + Tailwind
- ✅ Tipagem de banco em `types/supabase.ts`
- 🚫 Não usamos mais Firebase

Abaixo estão **códigos antigos**, que usavam Firebase. Eles estão quebrados e não são para copiar diretamente. 

❗ O objetivo é APENAS aproveitar os conteúdos, estruturas de página e lógica para refatorar para o novo padrão.

---

## 🛠️ Refatore assim:
- use `useAuth()` do novo hook
- use `supabase` do `lib/supabase.ts`
- use `user.publicMetadata.role` para roles
- mantenha estilos com Tailwind (ou melhore)
- reescreva com foco em acessibilidade, clareza, boas práticas e componentização


---

## CÓDIGOS ANTIGOS A REFATORAR

## SelecaoTipoCadastro

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import useAuth from '../hooks/useAuth';
import confetti from 'canvas-confetti';
import Header from '../components/header';
import Footer from '../components/Footer';

const TIPOS_CADASTRO = [
  {
    id: 'atleta',
    titulo: 'Atleta',
    descricao: 'Quero competir no Interbox 2025',
    icon: '❱',
    accentColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'judge',
    titulo: 'Judge',
    descricao: 'Quero ser judge do evento',
    icon: '▞',
    accentColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'midia',
    titulo: 'Mídia',
    descricao: 'Quero cobrir o evento',
    icon: '▮',
    accentColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'espectador',
    titulo: 'Torcida',
    descricao: 'Acompanhe as competições e participe da comunidade',
    icon: '❱',
    accentColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'publico',
    titulo: 'Público Geral',
    descricao: 'Outro tipo de participação',
    icon: '▞',
    accentColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
];

export default function SelecaoTipoCadastro() {
  const navigate = useNavigate();
  const { user,  logout } = useAuth();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: user?.displayName || '',
    email: user?.email || '',
    whatsapp: '',
    box: '',
    cidade: '',
    mensagem: '',
  });

  // 🎯 ATUALIZAR EMAIL AUTOMATICAMENTE QUANDO USER MUDAR
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        nome: user.displayName || prev.nome
      }));
    }
  }, [user]);

  const handleTypeSelect = (tipoId: string) => {
    setSelectedType(tipoId);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedType) return;

    setLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...formData,
        uid: user.uid,
        displayName: formData.nome,
        email: formData.email,
        categoria: selectedType,
        role: selectedType,
        isActive: true,
        profileComplete: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        gamification: {
          tokens: {
            box: {
              balance: 10,           // ✅ +10 $BOX por cadastro
              totalEarned: 10,       // ✅ +10 $BOX por cadastro
              totalSpent: 0,
              lastTransaction: serverTimestamp(),
            },
          },
          level: 'cindy',           // A Base - Começa aqui!
          totalActions: 1,
          lastActionAt: serverTimestamp(),
          achievements: ['primeiro_cadastro'],
          rewards: [],
                  frequenciaDias: 1,
        ultimoLoginFrequencia: serverTimestamp(),
          referralCode: `REF${user.uid.slice(-6).toUpperCase()}`,
          referrals: [],
          referralTokens: 0,
          weeklyTokens: 10,          // ✅ +10 $BOX por cadastro
          monthlyTokens: 10,         // ✅ +10 $BOX por cadastro
          yearlyTokens: 10,          // ✅ +10 $BOX por cadastro
          melhorFrequencia: 1,
          badges: ['primeiro_cadastro'],
          challenges: [],
        },
      });

      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.6 },
        colors: ['#007AFF', '#34C759', '#FF9500'],
      });

      setTimeout(async () => {
        // Forçar atualização do perfil para garantir dados corretos
        await logout();
        
        alert(`🎉 Cadastro realizado com sucesso! 
        
🏆 Primeira Conquista: +10 ₿ØX
🎯 Nível: Iniciante
        📈 Frequência: 1 dia

Bem-vindo ao Interbox 2025! 🚀`);
        
        // Redirecionar para o perfil correto baseado no tipo selecionado
        switch (selectedType) {
          case 'atleta':
            navigate('/perfil/atleta'); // ✅ Rota existe e redireciona para /perfil
            break;
          case 'judge':
            navigate('/perfil/judge'); // ✅ Rota existe
            break;
          case 'midia':
            navigate('/perfil/midia'); // ✅ Rota existe
            break;
          case 'espectador':
            navigate('/perfil/espectador'); // ✅ Rota existe
            break;
          case 'publico':
            navigate('/perfil/espectador'); // ✅ Rota geral para público
            break;
          default:
            navigate('/perfil'); // ✅ Fallback para perfil geral
            break;
        }
      }, 1000);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      alert('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const selectedTipo = TIPOS_CADASTRO.find((t) => t.id === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="container mx-auto px-3 py-4 max-w-sm">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-5">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">❱</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  Escolha seu perfil
                </h1>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Escolha o tipo de cadastro que melhor representa você
                </p>
              </div>

              <div className="space-y-2">
                {TIPOS_CADASTRO.map((tipo, index) => (
                  <motion.div
                    key={tipo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`
                      cursor-pointer transition-all duration-200 bg-white rounded-xl shadow-sm border border-gray-200
                      hover:shadow-md hover:border-gray-300 active:scale-95
                    `}
                    onClick={() => handleTypeSelect(tipo.id)}
                  >
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-gray-700">{tipo.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {tipo.titulo}
                          </h3>
                          <p className="text-gray-500 text-xs leading-tight">
                            {tipo?.descricao ?? '—'}
                          </p>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-5">
                <button
                  onClick={() => setShowForm(false)}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-3 text-xs"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar
                </button>
                
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <span className="text-lg text-white font-bold">{selectedTipo?.icon}</span>
                </div>
                
                <h1 className="text-lg font-bold text-gray-900 mb-2">
                  {selectedTipo?.titulo}
                </h1>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Complete seus dados para finalizar o cadastro
                </p>
                
                {/* 🎯 INDICAÇÃO DE EMAIL PREENCHIDO */}
                {user?.email && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700">
                      ✅ Email: <strong>{user.email}</strong> (preenchido anteriormente)
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-3">
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="nome" className="block text-xs font-medium text-gray-700 mb-1">
                          Nome Completo
                        </label>
                        <input
                          id="nome"
                          type="text"
                          name="nome"
                          value={formData.nome}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-sm"
                        />
                      </div>

                      {/* 🎯 EMAIL INVISÍVEL - Usuário já está logado */}
                      <input
                        type="hidden"
                        name="email"
                        value={user?.email || ''}
                      />

                      <div>
                        <label htmlFor="whatsapp" className="block text-xs font-medium text-gray-700 mb-1">
                          WhatsApp
                        </label>
                        <input
                          id="whatsapp"
                          type="tel"
                          name="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleChange}
                          placeholder="(11) 99999-9999"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="box" className="block text-xs font-medium text-gray-700 mb-1">
                          Box/Academia
                        </label>
                        <input
                          id="box"
                          type="text"
                          name="box"
                          value={formData.box}
                          onChange={handleChange}
                          placeholder="Nome da sua academia"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="cidade" className="block text-xs font-medium text-gray-700 mb-1">
                          Cidade
                        </label>
                        <input
                          id="cidade"
                          type="text"
                          name="cidade"
                          value={formData.cidade}
                          onChange={handleChange}
                          required
                          placeholder="Sua cidade"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="mensagem" className="block text-xs font-medium text-gray-700 mb-1">
                        Mensagem/Motivação
                      </label>
                      <textarea
                        id="mensagem"
                        name="mensagem"
                        value={formData.mensagem}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 resize-none text-sm"
                        placeholder="Conte um pouco sobre sua motivação para participar do evento..."
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 text-sm shadow-sm"
                    >
                      {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}


## atleta.tsx

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '../lib/firebase'
import { PerfilLayout } from '../components/PerfilLayout'
import { ProfileSettings } from '../components/ProfileSettings'
import { DropdownSelector } from '../components/DropdownSelector'
import { TabComingSoonOverlay } from '../components/TabComingSoonOverlay'
import { UserRole } from '../types/firestore'
import { useAnalytics } from '../hooks/useAnalytics'

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

// Tipos de usuário
export type Status = 'ativo' | 'pendente' | 'inativo' | 'cancelado' | 'aprovado' | 'rejeitado'

// Categorias de competição
export type CategoriaCompeticao = 'Scale' | 'RX' | 'Elite' | 'Master 145+' | 'Amador'

// Tipos de audiovisual
export type AudiovisualTipo = 'fotografo' | 'videomaker' | 'jornalista' | 'influencer' | 'youtuber' | 'outro'

// Interfaces específicas
interface UserData {
  uid: string
  email: string
  role: UserRole
  displayName: string
  photoURL?: string
  gamification?: {
    level?: string
    tokens?: {
      box?: {
        balance?: number
      }
    }
  }
}

interface FirestoreDocument {
  id: string
  [key: string]: unknown
}

// Interfaces específicas para melhor tipagem
interface FirestoreUser extends FirestoreDocument {
  displayName?: string
  email?: string
  role?: UserRole
  status?: Status
  teamId?: string
  categoria?: CategoriaCompeticao
}

interface FirestoreTeam extends FirestoreDocument {
  nome?: string
  name?: string
  categoria?: CategoriaCompeticao
  members?: unknown[]
  status?: string
  captainUid?: string
  box?: {
    nome?: string
    cidade?: string
  }
  competition?: {
    resultados?: Array<{
      pontuacao: number
      prova: string
      data: Date
    }>
  }
}

interface FirestoreEvent extends FirestoreDocument {
  nome?: string
  data?: Date
  categoria?: string
  resultado?: string
  pontuacao?: number
}

// Interface para BØX do usuário (conquistas da gamificação)
interface UserBox extends FirestoreDocument {
  userId: string
  nivel: 'cindy' | 'helen' | 'fran' | 'annie' | 'murph' | 'matt' // Níveis validados
  evento: string
  data: Date
  descricao?: string
  pontuacao?: number
  categoria?: string
  imagem?: string
  status: 'ativo' | 'inativo' | 'pendente'
}

// ============================================================================
// CONFIGURAÇÕES DAS TABS
// ============================================================================

const ATLETA_TABS = [
  { id: 'perfil', label: '▮ Meu Perfil', icon: '▮' },
  { id: 'competicao', label: '◘ Dados de Competição', icon: '◘' },
  { id: 'time', label: '▞ Meu Time', icon: '▞' },
  { id: 'eventos', label: '▟ Histórico de Eventos', icon: '▟' },
  { id: 'convites', label: '▚ Sistema de Convites', icon: '▚' }
]

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function PerfilAtleta() {
  // Estados principais
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados dos dados
  const [userTeam, setUserTeam] = useState<FirestoreTeam | null>(null)
  const [userEvents, setUserEvents] = useState<FirestoreEvent[]>([])
  const [userBoxes, setUserBoxes] = useState<number>(0) // Contador de BØX ganhas
  const [userBoxesDetails, setUserBoxesDetails] = useState<UserBox[]>([]) // Detalhes das BØX
  const [loadingBoxes, setLoadingBoxes] = useState(false) // Loading específico para BØX
  const [isCaptain, setIsCaptain] = useState(false)

  // Estado para controlar a tab ativa
  const [activeTab, setActiveTab] = useState('perfil')
  
  // Estado para controlar modais
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const { trackPage } = useAnalytics()

  // ============================================================================
  // FUNÇÕES DE CARREGAMENTO DE DADOS
  // ============================================================================

  // Carregar dados do usuário
  const loadUserData = useCallback(async (uid: string) => {
    try {
      console.log('🔄 Carregando dados do usuário:', uid)
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        const userData = userDoc.data() as FirestoreUser
        console.log('📖 Dados carregados do Firestore:', userData)
        console.log('🖼️ photoURL carregado:', userData.photoURL)
        setUserData({
          uid,
          email: userData.email || '',
          role: userData.role || 'atleta',
          displayName: userData.displayName || '',
          photoURL: typeof userData.photoURL === 'string' ? userData.photoURL : undefined,
          gamification: userData.gamification as UserData['gamification']
        })
        console.log('✅ userData atualizado no estado')

        // Carregar time se existir
        if (userData.teamId) {
          const teamDoc = await getDoc(doc(db, 'teams', userData.teamId))
          if (teamDoc.exists()) {
            const teamData = teamDoc.data() as FirestoreTeam
            setUserTeam(teamData)
            setIsCaptain(teamData.captainUid === uid)
          }
        }

        // Carregar eventos do usuário
        const eventsQuery = query(
          collection(db, 'events'),
          where('participants', 'array-contains', uid),
          orderBy('data', 'desc')
        )
        const eventsSnapshot = await getDocs(eventsQuery)
        const events = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirestoreEvent[]
        setUserEvents(events)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error)
    }
  }, [])

  // Carregar BØX do usuário do Firestore
  const loadUserBoxes = useCallback(async (uid: string) => {
    try {
      setLoadingBoxes(true)
      
      // 🔥 INTEGRAÇÃO COM SISTEMA VALIDADO: Buscar dados de gamificação do usuário
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        setUserBoxesDetails([])
        setUserBoxes(0)
        return
      }
      
      const userData = userDoc.data()
      const achievements = userData?.gamification?.achievements || []
      const tokens = userData?.gamification?.tokens?.box?.balance || 0
      const level = userData?.gamification?.level || 'cindy'
      const totalActions = userData?.gamification?.totalActions || 0
      const challenges = userData?.gamification?.challenges || []
      const referralTokens = userData?.gamification?.referralTokens || 0
      const rewards = userData?.gamification?.rewards || []
      const streakDays = userData?.gamification?.streakDays || 0
      
      // 🔥 CONVERTER DADOS REAIS EM BØX VISUAIS
      const boxes: UserBox[] = []
      
      // 🏆 BØX por achievements específicos (sistema validado)
      if (achievements.includes('primeiro_pagamento')) {
        boxes.push({
          id: 'primeiro_pagamento',
          userId: uid,
          nivel: 'cindy',
          evento: '🏆 Primeiro Pagamento',
          data: new Date(),
          descricao: 'BÔNUS INAUGURAL - Primeira compra realizada na competição',
          pontuacao: 100, // +100 $BOX por compra_ingresso
          categoria: 'Pagamento',
          status: 'ativo'
        })
      }
      
      if (achievements.includes('perfil_completo')) {
        boxes.push({
          id: 'perfil_completo',
          userId: uid,
          nivel: 'helen',
          evento: '🏅 Perfil Completo',
          data: new Date(),
          descricao: 'BÔNUS INAUGURAL - Perfil 100% preenchido',
          pontuacao: 25, // +25 $BOX por completar_perfil
          categoria: 'Perfil',
          status: 'ativo'
        })
      }
      
      // 🎯 BØX por nível atual (ESTRUTURA VALIDADA - COMPETIÇÃO GAMIFICADA)
      // Baseado na escala validada: cindy → helen → fran → annie → murph → matt
      if (level === 'matt') {
        boxes.push({
          id: 'nivel_matt',
          userId: uid,
          nivel: 'matt',
          evento: '👑 Nível Matt',
          data: new Date(),
          descricao: '👑 O Escolhido - 2000+ $BOX conquistados! Ranking TOP da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'murph') {
        boxes.push({
          id: 'nivel_murph',
          userId: uid,
          nivel: 'murph',
          evento: '🛡️ Nível Murph',
          data: new Date(),
          descricao: '🛡️ A Prova Final - 1000-1999 $BOX! Top 10% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'annie') {
        boxes.push({
          id: 'nivel_annie',
          userId: uid,
          nivel: 'annie',
          evento: '⛓️ Nível Annie',
          data: new Date(),
          descricao: '⛓️ A Coordenação - 600-999 $BOX! Top 25% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'fran') {
        boxes.push({
          id: 'nivel_fran',
          userId: uid,
          nivel: 'fran',
          evento: '💣 Nível Fran',
          data: new Date(),
          descricao: '💣 O Inferno Curto - 300-599 $BOX! Top 40% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'helen') {
        boxes.push({
          id: 'nivel_helen',
          userId: uid,
          nivel: 'helen',
          evento: '🌀 Nível Helen',
          data: new Date(),
          descricao: '🌀 O Fôlego - 100-299 $BOX! Top 60% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'cindy') {
        boxes.push({
          id: 'nivel_cindy',
          userId: uid,
          nivel: 'cindy',
          evento: '👣 Nível Cindy',
          data: new Date(),
          descricao: '👣 A Base - 0-99 $BOX! Iniciando na competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      }
      
      // 🏆 BØX por challenges (desafios da competição)
      if (challenges && Array.isArray(challenges) && challenges.length > 0) {
        challenges.forEach((challenge: { name?: string; description?: string; points?: number }, index: number) => {
          boxes.push({
            id: `challenge_${index}`,
            userId: uid,
            nivel: 'annie', // Challenges são nível Annie (600-999 $BOX)
            evento: `🏆 Desafio: ${challenge.name || `#${index + 1}`}`,
            data: new Date(),
            descricao: `BØX por completar desafio da competição: ${challenge.description || 'Desafio gamificado'}`,
            pontuacao: challenge.points || 50,
            categoria: 'Competição',
            status: 'ativo'
          })
        })
      }
      
      // 🎁 BØX por referral (sistema de indicação da competição)
      if (referralTokens > 0) {
        boxes.push({
          id: 'referral_tokens',
          userId: uid,
          nivel: 'fran', // Referral é nível Fran (300-599 $BOX)
          evento: '👥 Sistema de Referral',
          data: new Date(),
          descricao: `BØX por indicar amigos para a competição: ${referralTokens} tokens`,
          pontuacao: referralTokens,
          categoria: 'Comunidade',
          status: 'ativo'
        })
      }
      
      // 🔥 BØX por streak (engajamento na competição)
      if (streakDays > 0) {
        const nivelStreak = streakDays >= 7 ? 'matt' : streakDays >= 3 ? 'murph' : 'helen'
        boxes.push({
          id: 'streak_days',
          userId: uid,
          nivel: nivelStreak,
          evento: '🔥 Sequência de Login',
          data: new Date(),
          descricao: `BØX por ${streakDays} dias consecutivos de engajamento na competição`,
          pontuacao: streakDays * 5,
          categoria: 'Engajamento',
          status: 'ativo'
        })
      }
      
      // 🏅 BØX por rewards (recompensas da competição)
      if (rewards && Array.isArray(rewards) && rewards.length > 0) {
        rewards.forEach((reward: { name?: string; description?: string; points?: number }, index: number) => {
          boxes.push({
            id: `reward_${index}`,
            userId: uid,
            nivel: 'annie', // Rewards são nível Annie (600-999 $BOX)
            evento: `🏅 Recompensa: ${reward.name || `#${index + 1}`}`,
            data: new Date(),
            descricao: `BØX por recompensa da competição: ${reward.description || 'Recompensa gamificada'}`,
            pontuacao: reward.points || 25,
            categoria: 'Recompensa',
            status: 'ativo'
          })
        })
      }
      
      // 🎯 BØX por total de ações (participação na competição)
      if (totalActions > 0) {
        const nivelAcoes = totalActions >= 100 ? 'matt' : totalActions >= 50 ? 'murph' : 'helen'
        boxes.push({
          id: 'total_acoes',
          userId: uid,
          nivel: nivelAcoes,
          evento: '🎯 Missões concluidas',
          data: new Date(),
          descricao: `BØX por ${totalActions} missões concluidas na competição`,
          pontuacao: totalActions,
          categoria: 'Participação',
          status: 'ativo'
        })
      }
      
      // 🎭 BØX por tipo de usuário (atleta) - REMOVIDO
      // BØX só será dado quando foto for uploadada (missão concluída)
      // if (userData.role === 'atleta') {
      //   boxes.push({
      //     id: 'role_atleta',
      //     userId: uid,
      //     nivel: 'helen',
      //     evento: '🏃 Atleta Confirmado',
      //     data: new Date(),
      //     descricao: 'BØX por finalizar o cadastro',
      //     pontuacao: 25,
      //     categoria: 'Cadastro',
      //     status: 'ativo'
      //   })
      // }
      
      // 🔥 FALLBACK: Tentar buscar em coleção userBoxes se existir
      try {
        const userBoxesQuery = query(
          collection(db, 'userBoxes'),
          where('userId', '==', uid),
          where('status', '==', 'ativo')
        )
        
        const userBoxesSnapshot = await getDocs(userBoxesQuery)
        const firestoreBoxes = userBoxesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserBox[]
        
        // Combinar BØX do sistema com BØX do Firestore
        const allBoxes = [...boxes, ...firestoreBoxes]
        
        // Remover duplicatas por ID
        const uniqueBoxes = allBoxes.filter((box, index, self) => 
          index === self.findIndex(b => b.id === box.id)
        )
        
        // Ordenar por data (mais recente primeiro)
        const sortedBoxes = uniqueBoxes.sort((a, b) => {
          const dateA = a.data instanceof Date ? a.data : new Date(a.data)
          const dateB = b.data instanceof Date ? b.data : new Date(b.data)
          return dateB.getTime() - dateA.getTime()
        })
        
        setUserBoxesDetails(sortedBoxes)
        setUserBoxes(sortedBoxes.length)
        
      } catch {
        // Se não existir coleção userBoxes, usar apenas BØX do sistema
        console.log('Coleção userBoxes não encontrada, usando sistema de achievements validado')
        setUserBoxesDetails(boxes)
        setUserBoxes(boxes.length)
      }
      
    } catch (error) {
      console.error('Erro ao carregar BØX do usuário:', error)
      setUserBoxesDetails([])
      setUserBoxes(0)
    } finally {
      setLoadingBoxes(false)
    }
  }, [])

  // Carregar dados de gamificação do usuário (saldo, nível, ranking)
  const loadUserGamification = useCallback(async (uid: string) => {
    try {
      setLoadingBoxes(true)
      
      // 🔥 INTEGRAÇÃO COM SISTEMA VALIDADO: Buscar dados de gamificação do usuário
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        setUserBoxes(0)
        return
      }
      
      const userData = userDoc.data()
      const boxBalance = userData?.gamification?.tokens?.box?.balance || 0
      
      // 🎯 Definir saldo de $BØX
      setUserBoxes(boxBalance)
      
      // 🏆 Carregar ranking do usuário
      // await loadUserRanking(uid) // Removido
      
    } catch (error) {
      console.error('Erro ao carregar dados de gamificação:', error)
      setUserBoxes(0)
    } finally {
      setLoadingBoxes(false)
    }
  }, [])

  // Função para obter informações do nível baseado no saldo de $BØX
  // Removida - não utilizada

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    const initializeAuth = async () => {
      const auth = await getAuth()
      const { onAuthStateChanged } = await import('firebase/auth');
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUserData(user.uid)
        await loadUserBoxes(user.uid) // Carregar BØX quando o usuário autenticar
        await loadUserGamification(user.uid) // Carregar dados de gamificação
      } else {
        setUserData(null)
        setUserTeam(null)
        setUserEvents([])
        setUserBoxesDetails([]) // Limpar BØX quando o usuário deslogar
        setUserBoxes(0)
      }
      setLoading(false)
    })

      return unsubscribe;
    };

    initializeAuth().then(unsubscribe => {
      if (unsubscribe) {
        return () => unsubscribe();
      }
    });
  }, [loadUserData, loadUserBoxes, loadUserGamification])

  // Carregar dados após autenticação
  useEffect(() => {
    if (userData && !loading) {
      trackPage()
    }
  }, [userData, loading, trackPage])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // ============================================================================
  // COMPONENTES DE RENDERIZAÇÃO
  // ============================================================================

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-500 mx-auto mb-4"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    )
  }

  // Access denied
  if (!userData || userData.role !== 'atleta') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="mb-4">Esta página é exclusiva para atletas.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-pink-600 to-blue-600 hover:from-pink-700 hover:to-blue-700 text-white px-4 py-2 rounded transition-all duration-300"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <p>Usuário não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <>
    <PerfilLayout
      tipo="ATLETA"
      nome={userData?.displayName || 'Atleta'}
      avatar={userData.photoURL}
      saldoBox={userBoxes}
      nivel={userData?.gamification?.level || 'cindy'}
      onSettings={() => setIsSettingsOpen(true)}
      onMore={() => console.log('Mais opções')}
    >
      {/* Dropdown Selector iOS Style */}
      <DropdownSelector
        options={ATLETA_TABS.map(tab => ({
          id: tab.id,
          label: tab.label,
          icon: tab.icon
        }))}
        selectedOption={activeTab}
        onOptionChange={setActiveTab}
        className="mb-6"
      />

      {/* Conteúdo das Tabs com Transição */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <TabContent 
          activeTab={activeTab} 
          userData={userData} 
          userTeam={userTeam} 
          userEvents={userEvents}
          isCaptain={isCaptain} 
          userBoxesDetails={userBoxesDetails}
          loadingBoxes={loadingBoxes}
        />
      </motion.div>

      {/* BottomSheet para ações */}
      {/* Removed BottomSheet */}
    </PerfilLayout>

    {/* Modais */}
    <ProfileSettings
      isOpen={isSettingsOpen}
      onClose={() => {
        setIsSettingsOpen(false)
        // Recarregar dados do usuário para atualizar o avatar
        if (userData?.uid) {
          loadUserData(userData.uid)
        }
      }}
    />
    </>
  )
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface TabContentProps {
  activeTab: string
  userData: UserData
  userTeam: FirestoreTeam | null
  userEvents: FirestoreEvent[]
  isCaptain: boolean
  userBoxesDetails: UserBox[]
  loadingBoxes: boolean
}

function TabContent({ activeTab, userData, userTeam, userEvents, isCaptain, userBoxesDetails, loadingBoxes }: TabContentProps) {
  switch (activeTab) {
    case 'competicao':
      return <CompeticaoTab userTeam={userTeam} />
    case 'time':
      return <TimeTab userTeam={userTeam} isCaptain={isCaptain} />
    case 'eventos':
      return <EventosTab userEvents={userEvents} />
    case 'convites':
      return <ConvitesTab />
    case 'perfil':
      return <PerfilTab userData={userData} userBoxesDetails={userBoxesDetails} loadingBoxes={loadingBoxes} />
    default:
      return <CompeticaoTab userTeam={userTeam} />
  }
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

const getCategoriaLabel = (categoria?: CategoriaCompeticao): string => {
  return categoria || 'N/A'
}

const getStatusLabel = (status?: string): string => {
  const statusLabels: Record<string, string> = {
    'incomplete': 'Incompleto',
    'complete': 'Completo',
    'confirmado': 'Confirmado',
    'cancelado': 'Cancelado',
    'ativo': 'Ativo',
    'pendente': 'Pendente',
    'inativo': 'Inativo'
  }
  return status ? statusLabels[status] || status : 'N/A'
}

// Competicao Tab - Refinado iOS-like
function CompeticaoTab({ userTeam }: { userTeam: FirestoreTeam | null }) {
  return (
    <TabComingSoonOverlay
      title="Dados de Competição"
      description="As estatísticas e resultados da competição estarão disponíveis em breve"
      icon="🏆"
    >
      <div className="space-y-8">
        {/* 🏆 Header da Competição */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Dados de Competição</h2>
              <p className="text-blue-100 text-sm">Suas estatísticas e resultados</p>
            </div>
          </div>
        
        {/* Status da Competição */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100 mb-1">Status</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                🚀 Ativo
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100 mb-1">Categoria</p>
              <p className="text-lg font-bold">{getCategoriaLabel(userTeam?.categoria)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Estatísticas de Competição */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <span className="text-blue-500 mr-3">📊</span>
          Estatísticas da Competição
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-sm text-blue-500">Provas Completas</div>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">0</div>
            <div className="text-sm text-indigo-500">Pontos Totais</div>
          </div>
        </div>
      </div>

      {/* 🎯 Próximas Provas */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <span className="text-green-500 mr-3">🎯</span>
          Próximas Provas
        </h3>
        
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-lg font-medium mb-2">Provas em Breve!</p>
          <p className="text-sm">As provas da competição aparecerão aqui</p>
        </div>
      </div>
    </div>
    </TabComingSoonOverlay>
  )
}

// Time Tab - Refinado iOS-like
function TimeTab({ userTeam, isCaptain }: { userTeam: FirestoreTeam | null; isCaptain: boolean }) {
  return (
    <TabComingSoonOverlay
      title="Meu Time"
      description="As funcionalidades completas do time estarão disponíveis em breve"
      icon="👥"
    >
      <div className="space-y-8">
        {/* 👥 Header do Time */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Meu Time</h2>
              <p className="text-green-100 text-sm">Informações sobre sua equipe</p>
            </div>
          </div>
        
        {/* Status do Time */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100 mb-1">Seu Status</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                {isCaptain ? '👑 Capitão' : '👤 Membro'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-100 mb-1">Categoria</p>
              <p className="text-lg font-bold">{getCategoriaLabel(userTeam?.categoria)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 Informações do Time */}
      {userTeam ? (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <span className="text-green-500 mr-3">🏆</span>
            Detalhes do Time
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Nome do Time</span>
              <span className="font-medium text-gray-900">{userTeam.nome || userTeam.name || 'Sem nome'}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Categoria</span>
              <span className="font-medium text-gray-900">{getCategoriaLabel(userTeam.categoria)}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600">Status</span>
              <span className="font-medium text-gray-900">{getStatusLabel(userTeam.status)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-lg font-medium mb-2">Nenhum Time</p>
            <p className="text-sm">Você ainda não está em um time</p>
          </div>
        </div>
      )}

      {/* 📊 Estatísticas do Time */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <span className="text-emerald-500 mr-3">📊</span>
          Estatísticas do Time
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <div className="text-sm text-green-500">Membros</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">0</div>
            <div className="text-sm text-emerald-500">Provas Completas</div>
          </div>
        </div>
      </div>
    </div>
    </TabComingSoonOverlay>
  )
}

// Eventos Tab - Refinado iOS-like
function EventosTab({ userEvents }: { userEvents: FirestoreEvent[] }) {
  return (
    <TabComingSoonOverlay
      title="Histórico de Eventos"
      description="O histórico completo de eventos estará disponível em breve"
      icon="📅"
    >
      <div className="space-y-8">
        {/* 📅 Header dos Eventos */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Histórico de Eventos</h2>
              <p className="text-purple-100 text-sm">Todos os eventos que você participou</p>
            </div>
          </div>
        
        {/* Resumo dos Eventos */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100 mb-1">Total de Eventos</p>
              <p className="text-2xl font-bold">{userEvents.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-100 mb-1">Último Evento</p>
              <p className="text-lg font-bold">
                {userEvents.length > 0 ? 'Recente' : 'Nenhum'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 📋 Lista de Eventos */}
      {userEvents.length > 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <span className="text-purple-500 mr-3">📋</span>
            Eventos Participados
          </h3>
          
          <div className="space-y-4">
            {userEvents.map((event) => (
              <div key={event.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="font-semibold text-gray-900">{event.nome || 'Evento sem nome'}</p>
                      <p className="text-sm text-gray-600">{event.data ? new Date(event.data).toLocaleDateString() : 'Data não informada'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      Participou
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-lg font-medium mb-2">Nenhum Evento</p>
            <p className="text-sm">Você ainda não participou de eventos</p>
          </div>
        </div>
      )}

      {/* 🎯 Próximos Eventos */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <span className="text-pink-500 mr-3">🎯</span>
          Próximos Eventos
        </h3>
        
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🚀</div>
          <p className="text-lg font-medium mb-2">Eventos em Breve!</p>
          <p className="text-sm">Novos eventos aparecerão aqui</p>
        </div>
      </div>
    </div>
    </TabComingSoonOverlay>
  )
}

// Convites Tab - Refinado iOS-like
function ConvitesTab() {
  return (
    <TabComingSoonOverlay
      title="Sistema de Convites"
      description="O sistema completo de convites estará disponível em breve"
      icon="📨"
    >
      <div className="space-y-8">
        {/* 📨 Header dos Convites */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📨</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Sistema de Convites</h2>
              <p className="text-orange-100 text-sm">Gerencie convites para eventos e times</p>
            </div>
          </div>
          
          {/* Status dos Convites */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-100 mb-1">Convites Pendentes</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-orange-100 mb-1">Convites Aceitos</p>
                <p className="text-lg font-bold">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* 📧 Enviar Convite */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <span className="text-orange-500 mr-3">📧</span>
            Enviar Convite
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email do Convidado</label>
              <input
                type="email"
                placeholder="convidado@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem (opcional)</label>
              <textarea
                placeholder="Convide alguém para participar!"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
              📧 Enviar Convite
            </button>
          </div>
        </div>

        {/* 📊 Histórico de Convites */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <span className="text-red-500 mr-3">📊</span>
            Histórico de Convites
          </h3>
          
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📧</div>
            <p className="text-lg font-medium mb-2">Nenhum Convite</p>
            <p className="text-sm">Você ainda não enviou convites</p>
          </div>
        </div>
      </div>
    </TabComingSoonOverlay>
  )
}

// Perfil Tab - Mostra informações básicas do usuário (LIMPA - sem redundâncias)
function PerfilTab({ userData, userBoxesDetails, loadingBoxes }: { 
  userData: UserData | null; 
  userBoxesDetails: UserBox[];
  loadingBoxes: boolean;
}) {
  if (!userData) return null

  return (
    <div className="space-y-8">
      {/* 🔥 Informações da Conta */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-blue-500 mr-2">🔥</span>
          Informações da Conta
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Nome</span>
            <span className="font-medium text-gray-900">{userData?.displayName || 'Não informado'}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">E-mail</span>
            <span className="font-medium text-gray-900">{userData?.email || 'Não informado'}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-600">Participando como</span>
            <span className="font-medium text-gray-900">{userData?.role || 'Não informado'}</span>
          </div>
        </div>
      </div>

      {/* 🎁 Seção de Conquistas e Missões */}
      <div className="space-y-6">
        
        {/* 🏆 Conquistas Ativas */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Minhas Conquistas ({userBoxesDetails.length})
          </h3>
          <p className="text-purple-100 text-sm mb-6">$BØX já conquistados</p>
          
          {loadingBoxes ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-purple-100">Carregando conquistas...</p>
            </div>
          ) : userBoxesDetails.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-purple-100">Nenhuma conquista ainda</p>
              <p className="text-purple-200 text-sm">Complete missões para ganhar $BØX!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {userBoxesDetails.slice(0, 5).map((box) => (
                <div key={box.id} className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={getBoxIcon(box.nivel)} 
                        alt={`Nível ${box.nivel}`}
                        className="w-8 h-8 object-contain"
                      />
                      <div>
                        <p className="font-semibold">{box.evento}</p>
                        <p className="text-purple-100 text-sm">{box.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{box.pontuacao}</div>
                      <div className="text-purple-100 text-sm">$BØX</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🎯 Missões Pendentes - iOS PWA Premium */}
        <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl border border-white/20 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">Missões Pendentes</h3>
              <p className="text-blue-100 text-sm font-medium">Complete para ganhar mais $BØX</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Missão: Avatar Personalizado */}
            <div className={`group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl ${userData.photoURL ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">Avatar Personalizado</p>
                    <p className="text-blue-100 text-sm">Escolha seu avatar personalizado</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-300">25</div>
                  <div className="text-blue-100 text-sm">$BØX</div>
                  {userData.photoURL ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30 mt-2 backdrop-blur-sm">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Concluída
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30 mt-2 backdrop-blur-sm">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                      Disponível
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Missão: Perfil Completo */}
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">Perfil Completo</p>
                    <p className="text-blue-100 text-sm">Preencha todas as informações</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-300">15</div>
                  <div className="text-blue-100 text-sm">$BØX</div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 mt-2 backdrop-blur-sm">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    Em Progresso
                  </span>
                </div>
              </div>
            </div>

            {/* Missão: Primeira Competição */}
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🏃</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">Primeira Competição</p>
                    <p className="text-blue-100 text-sm">Participe de uma prova</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-300">50</div>
                  <div className="text-blue-100 text-sm">$BØX</div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-400/30 mt-2 backdrop-blur-sm">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Bloqueada
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 📊 Progresso do Cadastro */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Progresso do Cadastro
          </h3>
          <p className="text-green-100 text-sm mb-6">Complete seu perfil para desbloquear mais funcionalidades</p>
          
          <div className="space-y-4">
            {/* Barra de Progresso */}
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${getProfileProgress(userData)}%` 
                }}
              ></div>
            </div>
            
            {/* Itens do Progresso */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{getProfileProgress(userData)}%</div>
                <div className="text-green-100 text-sm">Completo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{getProfileProgress(userData) >= 100 ? '🎉' : '🎯'}</div>
                <div className="text-green-100 text-sm">
                  {getProfileProgress(userData) >= 100 ? 'Perfil 100%' : 'Continue!'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Função para retornar o ícone de BØX baseado no nível
const getBoxIcon = (nivel: 'cindy' | 'helen' | 'fran' | 'annie' | 'murph' | 'matt') => {
  switch (nivel) {
    case 'cindy':
      return '/images/levels/cindy.webp'
    case 'helen':
      return '/images/levels/helen.webp'
    case 'fran':
      return '/images/levels/fran.webp'
    case 'annie':
      return '/images/levels/annie.webp'
    case 'murph':
      return '/images/levels/murph.webp'
    case 'matt':
      return '/images/levels/matt.webp'
    default:
      return '/images/levels/default.webp'
  }
}

// Função para calcular o progresso do perfil
const getProfileProgress = (userData: UserData): number => {
  let progress = 0
  let total = 0
  
  // Nome
  if (userData.displayName) progress += 20
  total += 20
  
  // Email
  if (userData.email) progress += 20
  total += 20
  
  // Foto
  if (userData.photoURL) progress += 30
  total += 30
  
  // Role
  if (userData.role) progress += 15
  total += 15
  
  // Gamification level
  if (userData.gamification?.level) progress += 15
  total += 15
  
  return Math.round((progress / total) * 100)
}

## perfil/judge.tsx

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore'
import { db, getAuth } from '../lib/firebase'
import { useAnalytics } from '../hooks/useAnalytics'
import { PerfilLayout } from '../components/PerfilLayout'
import { DropdownSelector } from '../components/DropdownSelector'
import { ProfileSettings } from '../components/ProfileSettings'
import { TabComingSoonOverlay } from '../components/TabComingSoonOverlay'
import { useUserRanking } from '../hooks/useUserRanking'
import type { UserRole } from '../types/firestore';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

// Tipos de usuário
export type CategoriaCompeticao = 'Scale' | 'RX' | 'Elite' | 'Master 145+' | 'Amador'

// Interfaces específicas
interface UserData {
  uid: string
  email: string
  role: UserRole
  displayName: string
  photoURL?: string
  gamification?: {
    level?: string
    tokens?: {
      box?: {
        balance?: number
      }
    }
  }
}

interface FirestoreDocument {
  id: string
  [key: string]: unknown
}

interface FirestoreTeam extends FirestoreDocument {
  nome?: string
  name?: string
  categoria?: CategoriaCompeticao
  members?: unknown[]
  status?: string
  box?: {
    nome?: string
    cidade?: string
  }
  competition?: {
    resultados?: Array<{
      pontuacao: number
    }>
  }
}

// Interface para BØX do usuário (CORRIGIDA para usar níveis válidos)
interface UserBox extends FirestoreDocument {
  userId: string
  nivel: 'cindy' | 'helen' | 'fran' | 'annie' | 'murph' | 'matt' // Níveis validados
  evento: string
  data: Date
  descricao?: string
  pontuacao?: number
  categoria?: string
  imagem?: string
  status: 'ativo' | 'inativo' | 'pendente'
}

// ============================================================================
// CONFIGURAÇÕES DAS TABS
// ============================================================================

const JUDGE_TABS = [
  { id: 'profile', label: '▞ Meu Perfil', icon: '▞' },
  { id: 'leaderboard', label: '◘ Leaderboard', icon: '◘' },
  { id: 'convites', label: '▟ Sistema de Convites', icon: '▟' },
  { id: 'julgamento', label: '▚ Sistema de Julgamento', icon: '▚' }
]

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function PerfilJudge() {
  // Estados principais
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados dos dados
  const [leaderboardProvas, setLeaderboardProvas] = useState<FirestoreTeam[]>([])
  const [userBoxes, setUserBoxes] = useState<number>(0) // Contador de BØX ganhas
  const [userBoxesDetails, setUserBoxesDetails] = useState<UserBox[]>([]) // Detalhes das BØX
  const [loadingBoxes, setLoadingBoxes] = useState(false) // Loading específico para BØX

  // Estado para controlar a tab ativa
  const [activeTab, setActiveTab] = useState('profile')
  
  // Estado para controlar modais
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  // Hook para ranking
  const { loadUserRanking } = useUserRanking()

  const { trackPage } = useAnalytics()

  // ============================================================================
  // FUNÇÕES DE CARREGAMENTO DE DADOS
  // ============================================================================

  // Função genérica para buscar coleção
  const fetchCollection = useCallback(async (collectionName: string): Promise<FirestoreDocument[]> => {
    try {
      const snapshot = await getDocs(collection(db, collectionName))
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error(`Erro ao carregar ${collectionName}:`, error)
      return []
    }
  }, [])

  // Carregar BØX do usuário do Firestore
  const loadUserBoxes = useCallback(async (uid: string) => {
    try {
      setLoadingBoxes(true)
      
      // 🔥 INTEGRAÇÃO COM SISTEMA VALIDADO: Buscar dados de gamificação do usuário
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        setUserBoxesDetails([])
        setUserBoxes(0)
        return
      }
      
      const userData = userDoc.data()
      const achievements = userData?.gamification?.achievements || []
      const tokens = userData?.gamification?.tokens?.box?.balance || 0
      const level = userData?.gamification?.level || 'cindy'
      const totalActions = userData?.gamification?.totalActions || 0
      
      // 🎯 Definir saldo de $BØX
      setUserBoxes(tokens)
      
      // 🔥 CONVERTER DADOS REAIS EM BØX VISUAIS (SISTEMA VALIDADO)
      const boxes: UserBox[] = []
      
      // 🏆 BØX por nível atual do usuário (sistema validado)
      if (level === 'matt') {
        boxes.push({
          id: 'nivel_matt',
          userId: uid,
          nivel: 'matt',
          evento: '👑 Nível Matt',
          data: new Date(),
          descricao: '👑 O Escolhido - 2000+ $BOX conquistados! Ranking TOP da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'murph') {
        boxes.push({
          id: 'nivel_murph',
          userId: uid,
          nivel: 'murph',
          evento: '🛡️ Nível Murph',
          data: new Date(),
          descricao: '🛡️ A Prova Final - 1000-1999 $BOX! Top 10% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'annie') {
        boxes.push({
          id: 'nivel_annie',
          userId: uid,
          nivel: 'annie',
          evento: '⛓️ Nível Annie',
          data: new Date(),
          descricao: '⛓️ A Coordenação - 600-999 $BOX! Top 25% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'fran') {
        boxes.push({
          id: 'nivel_fran',
          userId: uid,
          nivel: 'fran',
          evento: '💣 Nível Fran',
          data: new Date(),
          descricao: '💣 O Inferno Curto - 300-599 $BOX! Top 50% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'helen') {
        boxes.push({
          id: 'nivel_helen',
          userId: uid,
          nivel: 'helen',
          evento: '🌀 Nível Helen',
          data: new Date(),
          descricao: '🌀 O Fôlego - 100-299 $BOX! Top 75% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else {
        boxes.push({
          id: 'nivel_cindy',
          userId: uid,
          nivel: 'cindy',
          evento: '👣 Nível Cindy',
          data: new Date(),
          descricao: '👣 A Base - 0-99 $BOX! Começando a jornada na competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      }
      
      // 🎉 BØX por achievements específicos (sistema validado)
      if (achievements.includes('primeiro_pagamento')) {
        boxes.push({
          id: 'primeiro_pagamento',
          userId: uid,
          nivel: 'cindy',
          evento: '💳 Primeiro Pagamento',
          data: new Date(),
          descricao: 'BÔNUS INAUGURAL - Primeira compra realizada (+100 $BOX)',
          pontuacao: 100,
          categoria: 'Pagamento',
          status: 'ativo'
        })
      }
      
      if (achievements.includes('perfil_completo')) {
        boxes.push({
          id: 'perfil_completo',
          userId: uid,
          nivel: 'helen',
          evento: '✅ Perfil Completo',
          data: new Date(),
          descricao: 'BÔNUS INAUGURAL - Perfil 100% preenchido (+25 $BOX)',
          pontuacao: 25,
          categoria: 'Perfil',
          status: 'ativo'
        })
      }
      
      // 🎯 BØX por cadastro (sistema validado)
      if (totalActions >= 1) {
        boxes.push({
          id: 'cadastro_inicial',
          userId: uid,
          nivel: 'cindy',
          evento: '🚀 Cadastro Inicial',
          data: new Date(),
          descricao: 'BØX por se cadastrar no sistema (+10 $BOX)',
          pontuacao: 10,
          categoria: 'Sistema',
          status: 'ativo'
        })
      }
      
      // 🎭 BØX por tipo de usuário - REMOVIDO
      // BØX só será dado quando missões forem concluídas
      // if (userData.role === 'judge') {
      //   boxes.push({
      //     id: 'role_judge',
      //     userId: uid,
      //     nivel: 'cindy',
      //     evento: '⚖️ Judge Confirmado',
      //     data: new Date(),
      //     descricao: 'BØX por ser judge ativo no sistema (+25 $BOX)',
      //     pontuacao: 25,
      //     categoria: 'Role',
      //     status: 'ativo'
      //   })
      // }
      
      // 🔥 FALLBACK: Tentar buscar em coleção userBoxes se existir
      try {
        const userBoxesQuery = query(
          collection(db, 'userBoxes'),
          where('userId', '==', uid),
          where('status', '==', 'ativo')
        )
        
        const userBoxesSnapshot = await getDocs(userBoxesQuery)
        const firestoreBoxes = userBoxesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserBox[]
        
        // Combinar BØX do sistema com BØX do Firestore
        const allBoxes = [...boxes, ...firestoreBoxes]
        
        // Remover duplicatas por ID
        const uniqueBoxes = allBoxes.filter((box, index, self) => 
          index === self.findIndex(b => b.id === box.id)
        )
        
        setUserBoxesDetails(uniqueBoxes)
        
      } catch {
        console.log('Coleção userBoxes não encontrada, usando apenas BØX do sistema')
        setUserBoxesDetails(boxes)
      }
      
    } catch (error) {
      console.error('Erro ao carregar BØX do usuário:', error)
      setUserBoxesDetails([])
      setUserBoxes(0)
    } finally {
      setLoadingBoxes(false)
    }
  }, [])

  // Carregar leaderboard das provas
  const loadLeaderboardProvas = useCallback(async () => {
    try {
      const teamsData = await fetchCollection('teams') as FirestoreTeam[]
      
      const teamsWithCompetition = teamsData
        .filter((team) => team.competition?.resultados)
        .sort((a, b) => {
          const aTotal = a.competition?.resultados?.reduce((sum, prova) => sum + (prova.pontuacao || 0), 0) || 0
          const bTotal = b.competition?.resultados?.reduce((sum, prova) => sum + (prova.pontuacao || 0), 0) || 0
          return bTotal - aTotal
        })
        .slice(0, 50) // Mostra mais times para usuários comuns
      
      setLeaderboardProvas(teamsWithCompetition)
    } catch (error) {
      console.error('Erro ao carregar leaderboard de provas:', error)
    }
  }, [fetchCollection])

  // Carregar dados do usuário
  const loadUserData = useCallback(async (uid: string) => {
    try {
      console.log('🔄 Carregando dados do usuário:', uid)
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData
        console.log('📖 Dados carregados do Firestore:', userData)
        console.log('🖼️ photoURL carregado:', userData.photoURL)
        setUserData({
          uid,
          email: userData.email || '',
          role: userData.role || 'judge',
          displayName: userData.displayName || '',
          photoURL: typeof userData.photoURL === 'string' ? userData.photoURL : undefined,
          gamification: userData.gamification as UserData['gamification']
        })
        console.log('✅ userData atualizado no estado')
      } else {
        // Se não existir usuário, cria um perfil básico
        setUserData({
          uid,
          email: '',
          role: 'judge',
          displayName: 'Usuário'
        })
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error)
      // Fallback para usuário público
      setUserData({
        uid,
        email: '',
        role: 'judge',
        displayName: 'Usuário'
      })
    }
  }, [])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Autenticação
  useEffect(() => {
    const initializeAuth = async () => {
      const auth = await getAuth();
      const { onAuthStateChanged } = await import('firebase/auth');
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUserData(user.uid)
        await loadUserBoxes(user.uid) // Carregar BØX quando o usuário faz login
        await loadUserRanking(user.uid) // Carregar ranking do usuário
      } else {
        // Permitir acesso público ao leaderboard
        setUserData({
          uid: 'public',
          email: '',
          role: 'publico',
          displayName: 'Visitante'
        })
        setUserBoxesDetails([]) // Limpar BØX quando o usuário faz logout
        setUserBoxes(0)
      }
      setLoading(false)
    })
    return unsubscribe;
    };

    initializeAuth().then(unsubscribe => {
      if (unsubscribe) {
        return () => unsubscribe();
      }
    });
  }, [loadUserData, loadUserBoxes, loadUserRanking])

  // Carregar dados após definir usuário
  useEffect(() => {
    if (userData && !loading) {
      trackPage()
      loadLeaderboardProvas()
    }
  }, [userData, loading, trackPage, loadLeaderboardProvas])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // ============================================================================
  // COMPONENTES DE RENDERIZAÇÃO
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <p>Usuário não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <>
    <PerfilLayout
      tipo="JUDGE"
      nome={userData?.displayName || 'Judge'}
      avatar={userData.photoURL}
      saldoBox={userBoxes}
      nivel={userData?.gamification?.level || 'cindy'}
      onSettings={() => setIsSettingsOpen(true)}
      onMore={() => console.log('Mais opções')}
    >
      {/* Dropdown Selector iOS Style */}
      <DropdownSelector
        options={JUDGE_TABS.map(tab => ({
          id: tab.id,
          label: tab.label,
          icon: tab.icon
        }))}
        selectedOption={activeTab}
        onOptionChange={setActiveTab}
        className="mb-6"
      />

      {/* Conteúdo das Tabs com Transição */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <TabContent 
          activeTab={activeTab} 
          userData={userData} 
          leaderboardProvas={leaderboardProvas}
          userBoxes={userBoxes}
          userBoxesDetails={userBoxesDetails}
          loadingBoxes={loadingBoxes}
        />
      </motion.div>
        </PerfilLayout>

    {/* Modais */}
    <ProfileSettings
      isOpen={isSettingsOpen}
      onClose={() => {
        setIsSettingsOpen(false)
        // Recarregar dados do usuário para atualizar o avatar
        if (userData?.uid) {
          loadUserData(userData.uid)
        }
      }}
    />
    </>
  )
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface TabContentProps {
  activeTab: string
  userData: UserData
  leaderboardProvas: FirestoreTeam[]
  userBoxes: number
  userBoxesDetails: UserBox[]
  loadingBoxes: boolean
}

function TabContent({ activeTab, userData, leaderboardProvas, userBoxes, userBoxesDetails, loadingBoxes }: TabContentProps) {
  switch (activeTab) {
    case 'profile':
      return <ProfileTab userData={userData} userBoxes={userBoxes} userBoxesDetails={userBoxesDetails} loadingBoxes={loadingBoxes} />
    case 'leaderboard':
      return <LeaderboardTab leaderboardProvas={leaderboardProvas} />
    case 'convites':
      return <ConvitesTab userData={userData} />
    case 'julgamento':
      return <JulgamentoTab userData={userData} />
    default:
      return <ProfileTab userData={userData} userBoxes={userBoxes} userBoxesDetails={userBoxesDetails} loadingBoxes={loadingBoxes} />
  }
}



const getCategoriaLabel = (categoria?: CategoriaCompeticao): string => {
  return categoria || 'N/A'
}

// Profile Tab - Mostra informações básicas do usuário
function ProfileTab({ userData, userBoxes, userBoxesDetails, loadingBoxes }: { 
  userData: UserData | null; 
  userBoxes: number;
  userBoxesDetails: UserBox[];
  loadingBoxes: boolean;
}) {
  if (!userData) return null

  return (
    <div className="space-y-8">
      {/* 🎯 Header do Perfil - iOS Style */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚖️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Meu Perfil</h2>
              <p className="text-indigo-100 text-sm">Detalhes da sua conta e conquistas</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{userBoxes}</div>
            <div className="text-indigo-100 text-sm">$BØX</div>
          </div>
        </div>
        
        {/* 🏆 Status do Usuário */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-100 mb-1">Seu Status</p>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                  ⚖️ Judge
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-indigo-100 mb-1">Conquistas</p>
              <p className="text-lg font-bold">{userBoxesDetails.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Estatísticas do Usuário */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-indigo-500 mr-2">📊</span>
          Estatísticas
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{userBoxes}</div>
            <div className="text-sm text-indigo-500">$BØX Total</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{userBoxesDetails.length}</div>
            <div className="text-sm text-purple-500">Conquistas</div>
          </div>
        </div>
      </div>

      {/* 🎁 Seção de Conquistas e Missões */}
      <div className="space-y-6">
        
        {/* 🏆 Conquistas Ativas */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Minhas Conquistas ({userBoxesDetails.length})
          </h3>
          <p className="text-purple-100 text-sm mb-6">$BØX já conquistados</p>
          
          {loadingBoxes ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-purple-100">Carregando conquistas...</p>
            </div>
          ) : userBoxesDetails.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-purple-100">Nenhuma conquista ainda</p>
              <p className="text-purple-200 text-sm">Complete missões para ganhar $BØX!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {userBoxesDetails.slice(0, 5).map((box) => (
                <div key={box.id} className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={getBoxIcon(box.nivel)} 
                        alt={`Nível ${box.nivel}`}
                        className="w-8 h-8 object-contain"
                      />
                      <div>
                        <p className="font-semibold">{box.evento}</p>
                        <p className="text-purple-100 text-sm">{box.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{box.pontuacao}</div>
                      <div className="text-purple-100 text-sm">$BØX</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🎯 Missões Pendentes - iOS PWA Premium */}
        <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl border border-white/20 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">Missões Pendentes</h3>
              <p className="text-blue-100 text-sm font-medium">Complete para ganhar mais $BØX</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Missão: Avatar Personalizado */}
            <div className={`group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl ${userData.photoURL ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">Avatar Personalizado</p>
                    <p className="text-blue-100 text-sm">Escolha seu avatar personalizado</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-300">25</div>
                  <div className="text-blue-100 text-sm">$BØX</div>
                  {userData.photoURL ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30 mt-2 backdrop-blur-sm">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Concluída
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30 mt-2 backdrop-blur-sm">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                      Disponível
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Missão: Perfil Completo */}
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">Perfil Completo</p>
                    <p className="text-blue-100 text-sm">Preencha todas as informações</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-300">15</div>
                  <div className="text-blue-100 text-sm">$BØX</div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 mt-2 backdrop-blur-sm">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    Em Progresso
                  </span>
                </div>
              </div>
            </div>

            {/* Missão: Primeiro Julgamento */}
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">⚖️</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">Primeiro Julgamento</p>
                    <p className="text-blue-100 text-sm">Avalie uma prova como judge</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-300">40</div>
                  <div className="text-blue-100 text-sm">$BØX</div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-400/30 mt-2 backdrop-blur-sm">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Bloqueada
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 📊 Progresso do Cadastro */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Progresso do Cadastro
          </h3>
          <p className="text-green-100 text-sm mb-6">Complete seu perfil para desbloquear mais funcionalidades</p>
          
          <div className="space-y-4">
            {/* Barra de Progresso */}
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${getProfileProgress(userData)}%` 
                }}
              ></div>
            </div>
            
            {/* Itens do Progresso */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{getProfileProgress(userData)}%</div>
                <div className="text-green-100 text-sm">Completo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{getProfileProgress(userData) >= 100 ? '🎉' : '🎯'}</div>
                <div className="text-green-100 text-sm">
                  {getProfileProgress(userData) >= 100 ? 'Perfil 100%' : 'Continue!'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 Informações Adicionais */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-indigo-500 mr-2">🔥</span>
          Informações da Conta
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Nome</span>
            <span className="font-medium text-gray-900">{userData?.displayName || 'Não informado'}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-gray-900">{userData?.email || 'Não informado'}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-600">Função</span>
            <span className="font-medium text-gray-900">{userData?.role || 'Não informado'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Leaderboard Tab - Acessível para todos
function LeaderboardTab({ leaderboardProvas }: { leaderboardProvas: FirestoreTeam[] }) {
  if (leaderboardProvas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🏆</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Resultados em Breve!</h3>
        <p className="text-gray-600 text-lg">
          Os resultados das provas aparecerão aqui em tempo real durante o evento.
        </p>
        <div className="mt-8 text-sm text-gray-500">
          <p>Acompanhe as equipes competindo pelas melhores posições!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">🏆 Leaderboard das Provas</h3>
        <p className="opacity-90">Ranking atualizado em tempo real durante o evento</p>
        <div className="mt-4 text-sm opacity-75">
          <p>🥇 1º Lugar • 🥈 2º Lugar • 🥉 3º Lugar</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Posição
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Pontuação Total
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Provas Completas
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboardProvas.map((team, index) => {
              const totalPontos = team.competition?.resultados?.reduce((sum, prova) => sum + (prova.pontuacao || 0), 0) || 0
              const provasCount = team.competition?.resultados?.length || 0
               
              return (
                <tr key={team.id} className={`
                  ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}
                  hover:bg-gray-50 transition-colors
                `}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index === 0 && <span className="text-3xl mr-3">🥇</span>}
                      {index === 1 && <span className="text-3xl mr-3">🥈</span>}
                      {index === 2 && <span className="text-3xl mr-3">🥉</span>}
                      <span className={`text-xl font-bold ${
                        index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-gray-600' :
                        index === 2 ? 'text-orange-600' : 'text-gray-900'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-gray-900">
                      {team.nome || 'Time sem nome'}
                    </div>
                    {team.box?.nome && (
                      <div className="text-sm text-gray-600">
                        📍 {team.box.nome} {team.box.cidade && `• ${team.box.cidade}`}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {getCategoriaLabel(team.categoria)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-2xl font-bold text-green-600">
                      {totalPontos}
                    </div>
                    <div className="text-sm text-gray-500">pontos</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-blue-600">
                      {provasCount}
                    </div>
                    <div className="text-sm text-gray-500">provas</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Convites Tab - Sistema de convites para juízes
function ConvitesTab({ userData }: { userData: UserData | null }) {
  if (!userData) return null

  return (
    <TabComingSoonOverlay
      title="Sistema de Convites"
      description="O sistema completo de convites para juízes estará disponível em breve"
      icon="📧"
    >
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">📧 Sistema de Convites</h3>
        <p className="opacity-90">Convide outros profissionais para atuar como juízes no evento</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">⚖️ Convites para Juízes</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email do Convidado</label>
            <input
              type="email"
              placeholder="juiz@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem (opcional)</label>
            <textarea
              placeholder="Convide outro juiz para participar do evento!"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md transition-colors">
            📧 Enviar Convite
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 Histórico de Convites</h4>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📧</div>
          <p>Nenhum convite enviado ainda.</p>
        </div>
      </div>
    </div>
    </TabComingSoonOverlay>
  )
}

// Julgamento Tab - Sistema de Julgamento
function JulgamentoTab({ userData }: { userData: UserData | null }) {
  if (!userData) return null

  return (
    <TabComingSoonOverlay
      title="Sistema de Julgamento"
      description="O sistema completo de julgamento estará disponível em breve"
      icon="⚖️"
    >
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">⚖️ Sistema de Julgamento</h3>
        <p className="opacity-90">Gerencie os resultados das provas e atribua pontuações</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">📋 Provas para Julgamento</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Prova
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Pontuação
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-bold text-gray-900">Prova de Força</div>
                  <div className="text-sm text-gray-600">Categoria: RX</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    RX
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-2xl font-bold text-green-600">100</div>
                  <div className="text-sm text-gray-500">pontos</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Aprovado
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Editar</button>
                  <button className="text-red-600 hover:text-red-900 ml-2">Excluir</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-bold text-gray-900">Prova de Resistência</div>
                  <div className="text-sm text-gray-600">Categoria: Scale</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Scale
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-2xl font-bold text-red-600">50</div>
                  <div className="text-sm text-gray-500">pontos</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Reprovado
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Editar</button>
                  <button className="text-red-600 hover:text-red-900 ml-2">Excluir</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">🔗 Links de Acesso</h4>
        <div className="space-y-3">
          <a href="#" className="flex items-center p-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0-3 3V6a3 3 0 1 0 3-3H18a3 3 0 1 0-3 3"></path></svg>
            Link de Julgamento
          </a>
          <a href="#" className="flex items-center p-3 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0-3 3V6a3 3 0 1 0 3-3H18a3 3 0 1 0-3 3"></path></svg>
            Link de Avaliação
          </a>
        </div>
      </div>
    </div>
    </TabComingSoonOverlay>
  )
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

// Função para retornar o ícone de BØX baseado no nível
const getBoxIcon = (nivel: 'cindy' | 'helen' | 'fran' | 'annie' | 'murph' | 'matt') => {
  switch (nivel) {
    case 'cindy':
      return '/images/levels/cindy.webp'
    case 'helen':
      return '/images/levels/helen.webp'
    case 'fran':
      return '/images/levels/fran.webp'
    case 'annie':
      return '/images/levels/annie.webp'
    case 'murph':
      return '/images/levels/murph.webp'
    case 'matt':
      return '/images/levels/matt.webp'
    default:
      return '/images/levels/default.webp'
  }
}

// Função para calcular o progresso do perfil
const getProfileProgress = (userData: UserData): number => {
  let progress = 0
  let total = 0
  
  // Nome
  if (userData.displayName) progress += 20
  total += 20
  
  // Email
  if (userData.email) progress += 20
  total += 20
  
  // Foto
  if (userData.photoURL) progress += 30
  total += 30
  
  // Role
  if (userData.role) progress += 15
  total += 15
  
  // Gamification level
  if (userData.gamification?.level) progress += 15
  total += 15
  
  return Math.round((progress / total) * 100)
}

## perfil/midia.tsx

import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore'
import { db, getAuth } from '../lib/firebase'
import { useAnalytics } from '../hooks/useAnalytics'
import { PerfilLayout } from '../components/PerfilLayout'
import { DropdownSelector } from '../components/DropdownSelector'
import { ProfileSettings } from '../components/ProfileSettings'
import { TabComingSoonOverlay } from '../components/TabComingSoonOverlay'
import { useUserRanking } from '../hooks/useUserRanking'
import { motion } from 'framer-motion'
import type { UserRole } from '../types/firestore';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

// Tipos de usuário
export type CategoriaCompeticao = 'Scale' | 'RX' | 'Elite' | 'Master 145+' | 'Amador'

// Interfaces específicas
interface UserData {
  uid: string
  email: string
  role: UserRole
  displayName: string
  photoURL?: string
  gamification?: {
    level?: string
    tokens?: {
      box?: {
        balance?: number
      }
    }
  }
}

interface FirestoreDocument {
  id: string
  [key: string]: unknown
}

interface FirestoreTeam extends FirestoreDocument {
  nome?: string
  name?: string
  categoria?: CategoriaCompeticao
  members?: unknown[]
  status?: string
  box?: {
    nome?: string
    cidade?: string
  }
  competition?: {
    resultados?: Array<{
      pontuacao: number
    }>
  }
}

// Interface para BØX do usuário (CORRIGIDA para usar níveis válidos)
interface UserBox extends FirestoreDocument {
  userId: string
  nivel: 'cindy' | 'helen' | 'fran' | 'annie' | 'murph' | 'matt' // Níveis validados
  evento: string
  data: Date
  descricao?: string
  pontuacao?: number
  categoria?: string
  imagem?: string
  status: 'ativo' | 'inativo' | 'pendente'
}

// ============================================================================
// CONFIGURAÇÕES DAS TABS
// ============================================================================

const MIDIA_TABS = [
  { id: 'profile', label: '▞ Meu Perfil', icon: '▞' },
  { id: 'leaderboard', label: '◘ Leaderboard', icon: '◘' },
  { id: 'convites', label: '▟ Sistema de Convites', icon: '▟' },
  { id: 'conteudo', label: '❱❱ Upload de Conteúdo', icon: '❱❱' }
]

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function PerfilMidia() {
  // Estados principais
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados dos dados
  const [leaderboardProvas, setLeaderboardProvas] = useState<FirestoreTeam[]>([])
  const [userBoxes, setUserBoxes] = useState<number>(0) // Contador de BØX ganhas
  const [userBoxesDetails, setUserBoxesDetails] = useState<UserBox[]>([]) // Detalhes das BØX
  const [loadingBoxes, setLoadingBoxes] = useState(false) // Loading específico para BØX

  // Estado para controlar a tab ativa
  const [activeTab, setActiveTab] = useState('profile')
  
  // Estado para controlar modais
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  // Hook para ranking
  const { loadUserRanking } = useUserRanking()

  const { trackPage } = useAnalytics()

  // ============================================================================
  // FUNÇÕES DE CARREGAMENTO DE DADOS
  // ============================================================================

  // Função genérica para buscar coleção
  const fetchCollection = useCallback(async (collectionName: string): Promise<FirestoreDocument[]> => {
    try {
      const snapshot = await getDocs(collection(db, collectionName))
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error(`Erro ao carregar ${collectionName}:`, error)
      return []
    }
  }, [])

  // Carregar leaderboard das provas
  const loadLeaderboardProvas = useCallback(async () => {
    try {
      const teamsData = await fetchCollection('teams') as FirestoreTeam[]
      
      const teamsWithCompetition = teamsData
        .filter((team) => team.competition?.resultados)
        .sort((a, b) => {
          const aTotal = a.competition?.resultados?.reduce((sum, prova) => sum + (prova.pontuacao || 0), 0) || 0
          const bTotal = b.competition?.resultados?.reduce((sum, prova) => sum + (prova.pontuacao || 0), 0) || 0
          return bTotal - aTotal
        })
        .slice(0, 50) // Mostra mais times para usuários comuns
      
      setLeaderboardProvas(teamsWithCompetition)
    } catch (error) {
      console.error('Erro ao carregar leaderboard de provas:', error)
    }
  }, [fetchCollection])

  // Carregar BØX do usuário do Firestore
  const loadUserBoxes = useCallback(async (uid: string) => {
    try {
      setLoadingBoxes(true)
      
      // 🔥 INTEGRAÇÃO COM SISTEMA VALIDADO: Buscar dados de gamificação do usuário
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        setUserBoxesDetails([])
        setUserBoxes(0)
        return
      }
      
      const userData = userDoc.data()
      const achievements = userData?.gamification?.achievements || []
      const tokens = userData?.gamification?.tokens?.box?.balance || 0
      const level = userData?.gamification?.level || 'cindy'
      const totalActions = userData?.gamification?.totalActions || 0
      
      // 🎯 Definir saldo de $BØX
      setUserBoxes(tokens)
      
      // 🏆 Carregar ranking do usuário
      await loadUserRanking(uid)
      
      // 🔥 CONVERTER DADOS REAIS EM BØX VISUAIS (SISTEMA VALIDADO)
      const boxes: UserBox[] = []
      
      // 🏆 BØX por nível atual do usuário (sistema validado)
      if (level === 'matt') {
        boxes.push({
          id: 'nivel_matt',
          userId: uid,
          nivel: 'matt',
          evento: '👑 Nível Matt',
          data: new Date(),
          descricao: '👑 O Escolhido - 2000+ $BOX conquistados! Ranking TOP da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'murph') {
        boxes.push({
          id: 'nivel_murph',
          userId: uid,
          nivel: 'murph',
          evento: '🛡️ Nível Murph',
          data: new Date(),
          descricao: '🛡️ A Prova Final - 1000-1999 $BOX! Top 10% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'annie') {
        boxes.push({
          id: 'nivel_annie',
          userId: uid,
          nivel: 'annie',
          evento: '⛓️ Nível Annie',
          data: new Date(),
          descricao: '⛓️ A Coordenação - 600-999 $BOX! Top 25% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'fran') {
        boxes.push({
          id: 'nivel_fran',
          userId: uid,
          nivel: 'fran',
          evento: '💣 Nível Fran',
          data: new Date(),
          descricao: '💣 O Inferno Curto - 300-599 $BOX! Top 50% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'helen') {
        boxes.push({
          id: 'nivel_helen',
          userId: uid,
          nivel: 'helen',
          evento: '🌀 Nível Helen',
          data: new Date(),
          descricao: '🌀 O Fôlego - 100-299 $BOX! Top 75% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else {
        boxes.push({
          id: 'nivel_cindy',
          userId: uid,
          nivel: 'cindy',
          evento: '👣 Nível Cindy',
          data: new Date(),
          descricao: '👣 A Base - 0-99 $BOX! Começando a jornada na competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      }
      
      // 🎉 BØX por achievements específicos (sistema validado)
      if (achievements.includes('primeiro_pagamento')) {
        boxes.push({
          id: 'primeiro_pagamento',
          userId: uid,
          nivel: 'cindy',
          evento: '💳 Primeiro Pagamento',
          data: new Date(),
          descricao: 'BÔNUS INAUGURAL - Primeira compra realizada (+100 $BOX)',
          pontuacao: 100,
          categoria: 'Pagamento',
          status: 'ativo'
        })
      }
      
      if (achievements.includes('perfil_completo')) {
        boxes.push({
          id: 'perfil_completo',
          userId: uid,
          nivel: 'helen',
          evento: '✅ Perfil Completo',
          data: new Date(),
          descricao: 'BÔNUS INAUGURAL - Perfil 100% preenchido (+25 $BOX)',
          pontuacao: 25,
          categoria: 'Perfil',
          status: 'ativo'
        })
      }
      
      // 🎯 BØX por cadastro (sistema validado)
      if (totalActions >= 1) {
        boxes.push({
          id: 'cadastro_inicial',
          userId: uid,
          nivel: 'cindy',
          evento: '🚀 Cadastro Inicial',
          data: new Date(),
          descricao: 'BØX por se cadastrar no sistema (+10 $BOX)',
          pontuacao: 10,
          categoria: 'Sistema',
          status: 'ativo'
        })
      }
      
      // 🎭 BØX por tipo de usuário
      if (userData.role === 'atleta') {
        boxes.push({
          id: 'role_atleta',
          userId: uid,
          nivel: 'cindy',
          evento: '🏃 Atleta Confirmado',
          data: new Date(),
          descricao: 'BØX por ser atleta ativo no sistema (+25 $BOX)',
          pontuacao: 25,
          categoria: 'Role',
          status: 'ativo'
        })
      }
      
      // 🎭 BØX por tipo de usuário - REMOVIDO
      // BØX só será dado quando missões forem concluídas
      // if (userData.role === 'midia') {
      //   boxes.push({
      //     id: 'role_midia',
      //     userId: uid,
      //     nivel: 'cindy',
      //     evento: '📸 Profissional de Mídia',
      //     data: new Date(),
      //     descricao: 'BØX por ser profissional de mídia ativo no sistema (+25 $BOX)',
      //     pontuacao: 25,
      //     categoria: 'Role',
      //     status: 'ativo'
      //   })
      // }
      
      // 🔥 FALLBACK: Tentar buscar em coleção userBoxes se existir
      try {
        const userBoxesQuery = query(
          collection(db, 'userBoxes'),
          where('userId', '==', uid),
          where('status', '==', 'ativo')
        )
        
        const userBoxesSnapshot = await getDocs(userBoxesQuery)
        const firestoreBoxes = userBoxesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserBox[]
        
        // Combinar BØX do sistema com BØX do Firestore
        const allBoxes = [...boxes, ...firestoreBoxes]
        
        // Remover duplicatas por ID
        const uniqueBoxes = allBoxes.filter((box, index, self) => 
          index === self.findIndex(b => b.id === box.id)
        )
        
        setUserBoxesDetails(uniqueBoxes)
        
      } catch {
        console.log('Coleção userBoxes não encontrada, usando apenas BØX do sistema')
        setUserBoxesDetails(boxes)
      }
      
    } catch (error) {
      console.error('Erro ao carregar BØX do usuário:', error)
      setUserBoxesDetails([])
      setUserBoxes(0)
    } finally {
      setLoadingBoxes(false)
    }
  }, [loadUserRanking])

  // Carregar dados do usuário
  const loadUserData = useCallback(async (uid: string) => {
    try {
      console.log('🔄 Carregando dados do usuário:', uid)
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData
        console.log('📖 Dados carregados do Firestore:', userData)
        console.log('🖼️ photoURL carregado:', userData.photoURL)
        setUserData({
          uid,
          email: userData.email || '',
          role: userData.role || 'publico',
          displayName: userData.displayName || '',
          photoURL: typeof userData.photoURL === 'string' ? userData.photoURL : undefined,
          gamification: userData.gamification
        })
        console.log('✅ userData atualizado no estado')
      } else {
        // Se não existir usuário, cria um perfil básico
        setUserData({
          uid,
          email: '',
          role: 'publico',
          displayName: 'Usuário'
        })
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error)
      // Fallback para usuário público
      setUserData({
        uid,
        email: '',
        role: 'publico',
        displayName: 'Usuário'
      })
    }
  }, [])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Autenticação
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const auth = await getAuth();
        const { onAuthStateChanged } = await import('firebase/auth');
        
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            await loadUserData(user.uid)
            await loadUserBoxes(user.uid) // Carregar BØX quando o usuário faz login
          } else {
            // Permitir acesso público ao leaderboard
            setUserData({
              uid: 'public',
              email: '',
              role: 'publico',
              displayName: 'Visitante'
            })
          }
          setLoading(false)
        })
        return unsubscribe;
      } catch (error) {
        console.error('❌ PerfilMidia: Erro na autenticação:', error)
        setLoading(false)
      }
    };

    initializeAuth().then(unsubscribe => {
      if (unsubscribe) {
        return () => unsubscribe();
      }
    });
  }, [loadUserData, loadUserBoxes])

  // Carregar dados após definir usuário
  useEffect(() => {
    if (userData && !loading) {
      trackPage()
      loadLeaderboardProvas()
      if (userData.uid !== 'public') {
        loadUserBoxes(userData.uid)
      }
    }
  }, [userData, loading, trackPage, loadLeaderboardProvas, loadUserBoxes])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // ============================================================================
  // COMPONENTES DE RENDERIZAÇÃO
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <p>Usuário não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <>
    <PerfilLayout
      tipo="MÍDIA"
      nome={userData?.displayName || 'Mídia'}
      avatar={userData.photoURL}
      saldoBox={userBoxes}
      nivel={userData?.gamification?.level || 'cindy'}
      onSettings={() => setIsSettingsOpen(true)}
      onMore={() => console.log('Mais opções')}
    >
      {/* Dropdown Selector iOS Style */}
      <DropdownSelector
        options={MIDIA_TABS.map(tab => ({
          id: tab.id,
          label: tab.label,
          icon: tab.icon
        }))}
        selectedOption={activeTab}
        onOptionChange={setActiveTab}
        className="mb-6"
      />

      {/* Conteúdo das Tabs com Transição */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <TabContent 
          activeTab={activeTab} 
          userData={userData} 
          leaderboardProvas={leaderboardProvas}
          userBoxes={userBoxes}
          userBoxesDetails={userBoxesDetails}
          loadingBoxes={loadingBoxes}
        />
      </motion.div>
    </PerfilLayout>

    {/* Modais */}
    <ProfileSettings
      isOpen={isSettingsOpen}
      onClose={() => {
        setIsSettingsOpen(false)
        // Recarregar dados do usuário para atualizar o avatar
        if (userData?.uid) {
          loadUserData(userData.uid)
        }
      }}
    />
    </>
  )
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface TabContentProps {
  activeTab: string
  userData: UserData
  leaderboardProvas: FirestoreTeam[]
  userBoxes: number
  userBoxesDetails: UserBox[]
  loadingBoxes: boolean
}

function TabContent({ activeTab, userData, leaderboardProvas, userBoxes, userBoxesDetails, loadingBoxes }: TabContentProps) {
  switch (activeTab) {
    case 'profile':
      return <ProfileTab userData={userData} userBoxes={userBoxes} userBoxesDetails={userBoxesDetails} loadingBoxes={loadingBoxes} />
    case 'leaderboard':
      return <LeaderboardTab leaderboardProvas={leaderboardProvas} />
    case 'convites':
      return <ConvitesTab userData={userData} />
    case 'conteudo':
      return <ConteudoTab userData={userData} />
    default:
      return <ProfileTab userData={userData} userBoxes={userBoxes} userBoxesDetails={userBoxesDetails} loadingBoxes={loadingBoxes} />
  }
}



// Profile Tab - Mostra informações básicas do usuário
function ProfileTab({ userData, userBoxes, userBoxesDetails, loadingBoxes }: { 
  userData: UserData | null; 
  userBoxes: number;
  userBoxesDetails: UserBox[];
  loadingBoxes: boolean;
}) {
  if (!userData) return null

  return (
    <div className="space-y-8">
      {/* 🎯 Header do Perfil - iOS Style */}
      <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📸</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Meu Perfil</h2>
              <p className="text-pink-100 text-sm">Detalhes da sua conta e conquistas</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{userBoxes}</div>
            <div className="text-pink-100 text-sm">$BØX</div>
          </div>
        </div>
        
        {/* 🏆 Status do Usuário */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-pink-100 mb-1">Seu Status</p>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                  📸 Mídia
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-pink-100 mb-1">Conquistas</p>
              <p className="text-lg font-bold">{userBoxesDetails.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Estatísticas do Usuário */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-pink-500 mr-2">📊</span>
          Estatísticas
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-pink-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{userBoxes}</div>
            <div className="text-sm text-pink-500">$BØX Total</div>
          </div>
          <div className="bg-rose-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-rose-600">{userBoxesDetails.length}</div>
            <div className="text-sm text-rose-500">Conquistas</div>
          </div>
        </div>
      </div>

      {/* 🎁 Seção de Conquistas e Missões */}
      <div className="space-y-6">
        
        {/* 🏆 Conquistas Ativas */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Minhas Conquistas ({userBoxesDetails.length})
          </h3>
          <p className="text-rose-100 text-sm mb-6">$BØX já conquistados</p>
          
          {loadingBoxes ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-rose-100">Carregando conquistas...</p>
            </div>
          ) : userBoxesDetails.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-rose-100">Nenhuma conquista ainda</p>
              <p className="text-rose-200 text-sm">Complete missões para ganhar $BØX!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {userBoxesDetails.slice(0, 5).map((box) => (
                <div key={box.id} className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={getBoxIcon(box.nivel)} 
                        alt={`Nível ${box.nivel}`}
                        className="w-8 h-8 object-contain"
                      />
                      <div>
                        <p className="font-semibold">{box.evento}</p>
                        <p className="text-rose-100 text-sm">{box.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{box.pontuacao}</div>
                      <div className="text-rose-100 text-sm">$BØX</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🎯 Missões Pendentes - iOS PWA Premium */}
        <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl border border-white/20 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">Missões Pendentes</h3>
              <p className="text-blue-100 text-sm font-medium">Complete para ganhar mais $BØX</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Missão: Avatar Personalizado */}
            <div className={`group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl ${userData.photoURL ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">Avatar Personalizado</p>
                    <p className="text-blue-100 text-sm">Escolha seu avatar personalizado</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-300">25</div>
                  <div className="text-blue-100 text-sm">$BØX</div>
                  {userData.photoURL ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30 mt-2 backdrop-blur-sm">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Concluída
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30 mt-2 backdrop-blur-sm">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                      Disponível
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Missão: Perfil Completo */}
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">Perfil Completo</p>
                    <p className="text-blue-100 text-sm">Preencha todas as informações</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-300">15</div>
                  <div className="text-blue-100 text-sm">$BØX</div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 mt-2 backdrop-blur-sm">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    Em Progresso
                  </span>
                </div>
              </div>
            </div>

            {/* Missão: Primeiro Conteúdo */}
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">📹</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">Primeiro Conteúdo</p>
                    <p className="text-blue-100 text-sm">Faça upload de um vídeo/foto</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-300">35</div>
                  <div className="text-blue-100 text-sm">$BØX</div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-400/30 mt-2 backdrop-blur-sm">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Bloqueada
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 📊 Progresso do Cadastro */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Progresso do Cadastro
          </h3>
          <p className="text-green-100 text-sm mb-6">Complete seu perfil para desbloquear mais funcionalidades</p>
          
          <div className="space-y-4">
            {/* Barra de Progresso */}
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${getProfileProgress(userData)}%` 
                }}
              ></div>
            </div>
            
            {/* Itens do Progresso */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{getProfileProgress(userData)}%</div>
                <div className="text-green-100 text-sm">Completo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{getProfileProgress(userData) >= 100 ? '🎉' : '🎯'}</div>
                <div className="text-green-100 text-sm">
                  {getProfileProgress(userData) >= 100 ? 'Perfil 100%' : 'Continue!'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 Informações Adicionais */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-pink-500 mr-2">🔥</span>
          Informações da Conta
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Nome</span>
            <span className="font-medium text-gray-900">{userData?.displayName || 'Não informado'}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-gray-900">{userData?.email || 'Não informado'}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-600">Função</span>
            <span className="font-medium text-gray-900">{userData?.role || 'Não informado'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Leaderboard Tab - Acessível para todos
function LeaderboardTab({ leaderboardProvas }: { leaderboardProvas: FirestoreTeam[] }) {
  if (leaderboardProvas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🏆</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Resultados em Breve!</h3>
        <p className="text-gray-600 text-lg">
          Os resultados das provas aparecerão aqui em tempo real durante o evento.
        </p>
        <div className="mt-8 text-sm text-gray-500">
          <p>Acompanhe as equipes competindo pelas melhores posições!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">🏆 Leaderboard das Provas</h3>
        <p className="opacity-90">Ranking atualizado em tempo real durante o evento</p>
        <div className="mt-4 text-sm opacity-75">
          <p>🥇 1º Lugar • 🥈 2º Lugar • 🥉 3º Lugar</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Posição
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Pontuação Total
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Provas Completas
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboardProvas.map((team, index) => {
              const totalPontos = team.competition?.resultados?.reduce((sum, prova) => sum + (prova.pontuacao || 0), 0) || 0
              const provasCount = team.competition?.resultados?.length || 0
              
              return (
                <tr key={team.id} className={`
                  ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}
                  hover:bg-gray-50 transition-colors
                `}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index === 0 && <span className="text-3xl mr-3">🥇</span>}
                      {index === 1 && <span className="text-3xl mr-3">🥈</span>}
                      {index === 2 && <span className="text-3xl mr-3">🥉</span>}
                      <span className={`text-xl font-bold ${
                        index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-gray-600' :
                        index === 2 ? 'text-orange-600' : 'text-gray-900'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-gray-900">
                      {team.nome || 'Time sem nome'}
                    </div>
                    {team.box?.nome && (
                      <div className="text-sm text-gray-600">
                        📍 {team.box.nome} {team.box.cidade && `• ${team.box.cidade}`}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {/* getCategoriaLabel(team.categoria) */}
                      {team.categoria || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-2xl font-bold text-green-600">
                      {totalPontos}
                    </div>
                    <div className="text-sm text-gray-500">pontos</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-blue-600">
                      {provasCount}
                    </div>
                    <div className="text-sm text-gray-500">provas</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Convites Tab - Sistema de convites para profissionais de mídia
function ConvitesTab({ userData }: { userData: UserData | null }) {
  if (!userData) return null

  return (
    <TabComingSoonOverlay
      title="Sistema de Convites"
      description="O sistema completo de convites para mídia estará disponível em breve"
      icon="📧"
    >
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">📧 Sistema de Convites</h3>
        <p className="opacity-90">Convide outros profissionais de mídia para participar do evento</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">📸 Convites para Mídia</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email do Convidado</label>
            <input
              type="email"
              placeholder="midia@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem (opcional)</label>
            <textarea
              placeholder="Convide outro profissional de mídia para participar do evento!"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors">
            📧 Enviar Convite
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 Histórico de Convites</h4>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📧</div>
          <p>Nenhum convite enviado ainda.</p>
        </div>
      </div>
    </div>
    </TabComingSoonOverlay>
  )
}

// Conteudo Tab - Upload de conteúdo (desativado até o dia do evento)
function ConteudoTab({ userData }: { userData: UserData | null }) {
  if (!userData) return null

  return (
    <TabComingSoonOverlay
      title="Upload de Conteúdo"
      description="Esta funcionalidade estará disponível apenas no dia do evento"
      icon="📸"
    >
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">📸 Upload de Conteúdo</h3>
        <p className="opacity-90">Área para fotógrafos e videomakers subirem conteúdos do evento</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow border-2 border-dashed border-red-300">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🚫</div>
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Funcionalidade Desativada</h4>
          <p className="text-gray-600 mb-4">
            O upload de conteúdo estará disponível apenas no dia do evento.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">
              <strong>Nota:</strong> Esta funcionalidade será ativada pelo administrador 
              quando for necessário. Aguarde as instruções.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">📋 Preparação</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">1</span>
            </div>
            <span className="text-gray-700">Prepare seus equipamentos (câmera, drone, etc.)</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">2</span>
            </div>
            <span className="text-gray-700">Verifique as credenciais de acesso</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">3</span>
            </div>
            <span className="text-gray-700">Aguarde a ativação da funcionalidade</span>
          </div>
        </div>
      </div>
    </div>
    </TabComingSoonOverlay>
  )
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

// Função para retornar o ícone de BØX baseado no nível
const getBoxIcon = (nivel: 'cindy' | 'helen' | 'fran' | 'annie' | 'murph' | 'matt') => {
  switch (nivel) {
    case 'cindy':
      return '/images/levels/cindy.webp'
    case 'helen':
      return '/images/levels/helen.webp'
    case 'fran':
      return '/images/levels/fran.webp'
    case 'annie':
      return '/images/levels/annie.webp'
    case 'murph':
      return '/images/levels/murph.webp'
    case 'matt':
      return '/images/levels/matt.webp'
    default:
      return '/images/levels/default.webp'
  }
}

// Função para calcular o progresso do perfil
const getProfileProgress = (userData: UserData): number => {
  let progress = 0
  let total = 0
  
  // Nome
  if (userData.displayName) progress += 20
  total += 20
  
  // Email
  if (userData.email) progress += 20
  total += 20
  
  // Foto
  if (userData.photoURL) progress += 30
  total += 30
  
  // Role
  if (userData.role) progress += 15
  total += 15
  
  // Gamification level
  if (userData.gamification?.level) progress += 15
  total += 15
  
  return Math.round((progress / total) * 100)
}

## perfil/espectador.tsx

import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore'
import { db, getAuth } from '../lib/firebase'
import { useAnalytics } from '../hooks/useAnalytics'
import { PerfilLayout } from '../components/PerfilLayout'
import { DropdownSelector } from '../components/DropdownSelector'
import { ProfileSettings } from '../components/ProfileSettings'
import { TabComingSoonOverlay } from '../components/TabComingSoonOverlay'
import { useUserRanking } from '../hooks/useUserRanking'
import { ProfileOptions } from '../components/ProfileOptions'
import { motion } from 'framer-motion'
import type { UserRole } from '../types/firestore';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

// Tipos de usuário
export type CategoriaCompeticao = 'Scale' | 'RX' | 'Elite' | 'Iniciante' | 'Master 145+'

// Interfaces específicas
interface UserData {
  uid: string
  email: string
  role: UserRole
  displayName: string
  photoURL?: string
  gamification?: {
    level?: string
    tokens?: {
      box?: {
        balance?: number
      }
    }
  }
}

interface FirestoreDocument {
  id: string
  [key: string]: unknown
}

interface FirestoreTeam extends FirestoreDocument {
  nome?: string
  name?: string
  categoria?: CategoriaCompeticao
  members?: unknown[]
  status?: string
  box?: {
    nome?: string
    cidade?: string
  }
  competition?: {
    resultados?: Array<{
      pontuacao: number
    }>
  }
}

// Interface para BØX do usuário (CORRIGIDA para usar níveis válidos)
interface UserBox extends FirestoreDocument {
  userId: string
  nivel: 'cindy' | 'helen' | 'fran' | 'annie' | 'murph' | 'matt' // Níveis validados
  evento: string
  data: Date
  descricao?: string
  pontuacao?: number
  categoria?: string
  imagem?: string
  status: 'ativo' | 'inativo' | 'pendente'
}

// ============================================================================
// CONFIGURAÇÕES DAS TABS
// ============================================================================

const ESPECTADOR_TABS = [
  { id: 'profile', label: '▞ Meu Perfil', icon: '▞' },
  { id: 'leaderboard', label: '◘ Leaderboard', icon: '◘' },
  { id: 'convites', label: '▟ Sistema de Convites', icon: '▟' }
]

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function PerfilEspectador() {
  // Estados principais
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados dos dados
  const [leaderboardProvas, setLeaderboardProvas] = useState<FirestoreTeam[]>([])
  const [userBoxes, setUserBoxes] = useState<number>(0) // Contador de BØX ganhas
  const [userBoxesDetails, setUserBoxesDetails] = useState<UserBox[]>([]) // Detalhes das BØX
  const [loadingBoxes, setLoadingBoxes] = useState(false) // Loading específico para BØX

  // Estado para controlar a tab ativa
  const [activeTab, setActiveTab] = useState('profile')
  
  // Hook para ranking
  const { loadUserRanking } = useUserRanking()

  // Estados para modais
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)

  const { trackPage } = useAnalytics()

  // ============================================================================
  // FUNÇÕES DE CARREGAMENTO DE DADOS
  // ============================================================================

  // Função genérica para buscar coleção
  const fetchCollection = useCallback(async (collectionName: string): Promise<FirestoreDocument[]> => {
    try {
      const snapshot = await getDocs(collection(db, collectionName))
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error(`Erro ao carregar ${collectionName}:`, error)
      return []
    }
  }, [])

  // Carregar BØX do usuário do Firestore
  const loadUserBoxes = useCallback(async (uid: string) => {
    try {
      setLoadingBoxes(true)
      
      // 🔥 INTEGRAÇÃO COM SISTEMA VALIDADO: Buscar dados de gamificação do usuário
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        setUserBoxesDetails([])
        setUserBoxes(0)
        return
      }
      
      const userData = userDoc.data()
      const achievements = userData?.gamification?.achievements || []
      const tokens = userData?.gamification?.tokens?.box?.balance || 0
      const level = userData?.gamification?.level || 'cindy'
      const totalActions = userData?.gamification?.totalActions || 0
      
      // 🎯 Definir saldo de $BØX
      setUserBoxes(tokens)
      
      // 🔥 CONVERTER DADOS REAIS EM BØX VISUAIS (SISTEMA VALIDADO)
      const boxes: UserBox[] = []
      
      // 🏆 BØX por nível atual do usuário (sistema validado)
      if (level === 'matt') {
        boxes.push({
          id: 'nivel_matt',
          userId: uid,
          nivel: 'matt',
          evento: '👑 Nível Matt',
          data: new Date(),
          descricao: '👑 O Escolhido - 2000+ $BOX conquistados! Ranking TOP da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'murph') {
        boxes.push({
          id: 'nivel_murph',
          userId: uid,
          nivel: 'murph',
          evento: '🛡️ Nível Murph',
          data: new Date(),
          descricao: '🛡️ A Prova Final - 1000-1999 $BOX! Top 10% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'annie') {
        boxes.push({
          id: 'nivel_annie',
          userId: uid,
          nivel: 'annie',
          evento: '⛓️ Nível Annie',
          data: new Date(),
          descricao: '⛓️ A Coordenação - 600-999 $BOX! Top 25% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'fran') {
        boxes.push({
          id: 'nivel_fran',
          userId: uid,
          nivel: 'fran',
          evento: '💣 Nível Fran',
          data: new Date(),
          descricao: '💣 O Inferno Curto - 300-599 $BOX! Top 50% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else if (level === 'helen') {
        boxes.push({
          id: 'nivel_helen',
          userId: uid,
          nivel: 'helen',
          evento: '🌀 Nível Helen',
          data: new Date(),
          descricao: '🌀 O Fôlego - 100-299 $BOX! Top 75% da competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      } else {
        boxes.push({
          id: 'nivel_cindy',
          userId: uid,
          nivel: 'cindy',
          evento: '👣 Nível Cindy',
          data: new Date(),
          descricao: '👣 A Base - 0-99 $BOX! Começando a jornada na competição',
          pontuacao: tokens,
          categoria: 'Ranking',
          status: 'ativo'
        })
      }
      
      // 🎉 BØX por achievements específicos (sistema validado)
      if (achievements.includes('primeiro_pagamento')) {
        boxes.push({
          id: 'primeiro_pagamento',
          userId: uid,
          nivel: 'cindy',
          evento: '💳 Primeiro Pagamento',
          data: new Date(),
          descricao: 'BÔNUS INAUGURAL - Primeira compra realizada (+100 $BOX)',
          pontuacao: 100,
          categoria: 'Pagamento',
          status: 'ativo'
        })
      }
      
      if (achievements.includes('perfil_completo')) {
        boxes.push({
          id: 'perfil_completo',
          userId: uid,
          nivel: 'helen',
          evento: '✅ Perfil Completo',
          data: new Date(),
          descricao: 'BÔNUS INAUGURAL - Perfil 100% preenchido (+25 $BOX)',
          pontuacao: 25,
          categoria: 'Perfil',
          status: 'ativo'
        })
      }
      
      // 🎯 BØX por cadastro (sistema validado)
      if (totalActions >= 1) {
        boxes.push({
          id: 'cadastro_inicial',
          userId: uid,
          nivel: 'cindy',
          evento: '🚀 Cadastro Inicial',
          data: new Date(),
          descricao: 'BØX por se cadastrar no sistema (+10 $BOX)',
          pontuacao: 10,
          categoria: 'Sistema',
          status: 'ativo'
        })
      }
      
      // 🎭 BØX por tipo de usuário - REMOVIDO
      // BØX só será dado quando missões forem concluídas
      // if (userData.role === 'espectador') {
      //   boxes.push({
      //     id: 'role_espectador',
      //     userId: uid,
      //     nivel: 'cindy',
      //     evento: '👁️ Espectador Confirmado',
      //     data: new Date(),
      //     descricao: 'BØX por ser espectador ativo no sistema (+25 $BOX)',
      //     pontuacao: 25,
      //     categoria: 'Role',
      //     status: 'ativo'
      //   })
      // }
      
      // 🔥 FALLBACK: Tentar buscar em coleção userBoxes se existir
      try {
        const userBoxesQuery = query(
          collection(db, 'userBoxes'),
          where('userId', '==', uid),
          where('status', '==', 'ativo')
        )
        
        const userBoxesSnapshot = await getDocs(userBoxesQuery)
        const firestoreBoxes = userBoxesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserBox[]
        
        // Combinar BØX do sistema com BØX do Firestore
        const allBoxes = [...boxes, ...firestoreBoxes]
        
        // Remover duplicatas por ID
        const uniqueBoxes = allBoxes.filter((box, index, self) => 
          index === self.findIndex(b => b.id === box.id)
        )
        
        setUserBoxesDetails(uniqueBoxes)
        
      } catch {
        console.log('Coleção userBoxes não encontrada, usando apenas BØX do sistema')
        setUserBoxesDetails(boxes)
      }
      
    } catch (error) {
      console.error('Erro ao carregar BØX do usuário:', error)
      setUserBoxesDetails([])
      setUserBoxes(0)
    } finally {
      setLoadingBoxes(false)
    }
  }, [])

  // Carregar leaderboard das provas
  const loadLeaderboardProvas = useCallback(async () => {
    try {
      const teamsData = await fetchCollection('teams') as FirestoreTeam[]
      
      const teamsWithCompetition = teamsData
        .filter((team) => team.competition?.resultados)
        .sort((a, b) => {
          const aTotal = a.competition?.resultados?.reduce((sum, prova) => sum + (prova.pontuacao || 0), 0) || 0
          const bTotal = b.competition?.resultados?.reduce((sum, prova) => sum + (prova.pontuacao || 0), 0) || 0
          return bTotal - aTotal
        })
        .slice(0, 50) // Mostra mais times para usuários comuns
      
      setLeaderboardProvas(teamsWithCompetition)
    } catch (error) {
      console.error('Erro ao carregar leaderboard de provas:', error)
    }
  }, [fetchCollection])

  // Carregar dados do usuário
  const loadUserData = useCallback(async (uid: string) => {
    try {
      console.log('🔄 Carregando dados do usuário:', uid)
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData
        console.log('📖 Dados carregados do Firestore:', userData)
        console.log('🖼️ photoURL carregado:', userData.photoURL)
        setUserData({
          uid,
          email: userData.email || '',
          role: userData.role || 'publico',
          displayName: userData.displayName || '',
          photoURL: typeof userData.photoURL === 'string' ? userData.photoURL : undefined,
          gamification: userData.gamification
        })
        console.log('✅ userData atualizado no estado')
      } else {
        // Se não existir usuário, cria um perfil básico
        setUserData({
          uid,
          email: '',
          role: 'publico',
          displayName: 'Usuário'
        })
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error)
      // Fallback para usuário público
      setUserData({
        uid,
        email: '',
        role: 'publico',
        displayName: 'Usuário'
      })
    }
  }, [])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Autenticação
  useEffect(() => {
    const initializeAuth = async () => {
      const auth = await getAuth();
      const { onAuthStateChanged } = await import('firebase/auth');
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUserData(user.uid)
        await loadUserBoxes(user.uid) // Carregar BØX quando o usuário faz login
        await loadUserRanking(user.uid) // Carregar ranking do usuário
      } else {
        // Permitir acesso público ao leaderboard
        setUserData({
          uid: 'public',
          email: '',
          role: 'publico',
          displayName: 'Visitante'
        })
        setUserBoxesDetails([]) // Limpar BØX quando o usuário faz logout
        setUserBoxes(0)
      }
      setLoading(false)
    })
    return unsubscribe;
    };

    initializeAuth().then(unsubscribe => {
      if (unsubscribe) {
        return () => unsubscribe();
      }
    });
  }, [loadUserData, loadUserBoxes, loadUserRanking])

  // Carregar dados após definir usuário
  useEffect(() => {
    if (userData && !loading) {
      trackPage()
      loadLeaderboardProvas()
    }
  }, [userData, loading, trackPage, loadLeaderboardProvas])

  // ============================================================================
  // HANDLERS
  // ============================================================================





  // ============================================================================
  // COMPONENTES DE RENDERIZAÇÃO
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <p>Usuário não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PerfilLayout
        tipo="ESPECTADOR"
        nome={userData?.displayName || 'Espectador'}
        avatar={userData.photoURL}
        saldoBox={userBoxes}
        nivel={userData?.gamification?.level || 'cindy'}
        onSettings={() => setIsSettingsOpen(true)}
        onMore={() => console.log('Mais opções')}
      >
        {/* Dropdown Selector iOS Style */}
        <DropdownSelector
          options={ESPECTADOR_TABS.map(tab => ({
            id: tab.id,
            label: tab.label,
            icon: tab.icon
          }))}
          selectedOption={activeTab}
          onOptionChange={setActiveTab}
          className="mb-6"
        />

        {/* Conteúdo das Tabs com Transição */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <TabContent 
            activeTab={activeTab} 
            userData={userData} 
            leaderboardProvas={leaderboardProvas}
            userBoxes={userBoxes}
            userBoxesDetails={userBoxesDetails}
            loadingBoxes={loadingBoxes}
          />
        </motion.div>
      </PerfilLayout>

      {/* Modais */}
      <ProfileSettings
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false)
          // Recarregar dados do usuário para atualizar o avatar
          if (userData?.uid) {
            loadUserData(userData.uid)
          }
        }}
      />
      
      <ProfileOptions
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
      />
    </>
  )
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface TabContentProps {
  activeTab: string
  userData: UserData
  leaderboardProvas: FirestoreTeam[]
  userBoxes: number
  userBoxesDetails: UserBox[]
  loadingBoxes: boolean
}

function TabContent({ activeTab, userData, leaderboardProvas, userBoxes, userBoxesDetails, loadingBoxes }: TabContentProps) {
  switch (activeTab) {
    case 'profile':
      return <ProfileTab userData={userData} userBoxes={userBoxes} userBoxesDetails={userBoxesDetails} loadingBoxes={loadingBoxes} />
    case 'leaderboard':
      return <LeaderboardTab leaderboardProvas={leaderboardProvas} />
    case 'convites':
      return <ConvitesTab userData={userData} />
    default:
      return <ProfileTab userData={userData} userBoxes={userBoxes} userBoxesDetails={userBoxesDetails} loadingBoxes={loadingBoxes} />
  }
}



// Profile Tab - Mostra informações básicas do usuário
function ProfileTab({ userData, userBoxes, userBoxesDetails, loadingBoxes }: { 
  userData: UserData | null; 
  userBoxes: number;
  userBoxesDetails: UserBox[];
  loadingBoxes: boolean;
}) {
  if (!userData) return null

  return (
    <div className="space-y-8">
      {/* 🎯 Header do Perfil - iOS Style com Melhor Contraste */}
      <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-xl border border-orange-300/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center border-2 border-white/20">
              <span className="text-2xl">👁️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Meu Perfil</h2>
              <p className="text-orange-50 text-sm font-medium">Detalhes da sua conta e conquistas</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{userBoxes}</div>
            <div className="text-orange-50 text-sm font-medium">$BØX</div>
          </div>
        </div>
        
        {/* 🏆 Status do Usuário */}
        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-50 font-medium mb-1">Seu Status</p>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/30 text-white border border-white/20">
                  👁️ Espectador
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-orange-50 font-medium mb-1">Conquistas</p>
              <p className="text-lg font-bold text-white">{userBoxesDetails.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 📊 Estatísticas do Usuário */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-orange-500 mr-2">📊</span>
          Estatísticas
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{userBoxes}</div>
            <div className="text-sm text-orange-500">$BØX Total</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{userBoxesDetails.length}</div>
            <div className="text-sm text-red-500">Conquistas</div>
          </div>
        </div>
      </div>

      {/* 🎁 Seção de Conquistas e Missões */}
      <div className="space-y-6">
        
        {/* 🏆 Conquistas Ativas */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="mr-2">🏆</span>
            Minhas Conquistas ({userBoxesDetails.length})
          </h3>
          <p className="text-red-100 text-sm mb-6">$BØX já conquistados</p>
          
          {loadingBoxes ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-red-100">Carregando conquistas...</p>
            </div>
          ) : userBoxesDetails.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-red-100">Nenhuma conquista ainda</p>
              <p className="text-red-200 text-sm">Complete missões para ganhar $BØX!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {userBoxesDetails.slice(0, 5).map((box) => (
                <div key={box.id} className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={getBoxIcon(box.nivel)} 
                        alt={`Nível ${box.nivel}`}
                        className="w-8 h-8 object-contain"
                      />
                      <div>
                        <p className="font-semibold">{box.evento}</p>
                        <p className="text-red-100 text-sm">{box.categoria}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{box.pontuacao}</div>
                      <div className="text-red-100 text-sm">$BØX</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🎯 Missões Pendentes - iOS PWA Premium */}
        <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl border border-white/20 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3 className="text-xl font-bold">Missões Pendentes</h3>
              <p className="text-blue-100 text-sm font-medium">Complete para ganhar mais $BØX</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Missão: Avatar Personalizado */}
            <div className={`group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl ${userData.photoURL ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">Avatar Personalizado</p>
                    <p className="text-blue-100 text-sm">Escolha seu avatar personalizado</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-300">25</div>
                  <div className="text-blue-100 text-sm">$BØX</div>
                  {userData.photoURL ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30 mt-2 backdrop-blur-sm">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Concluída
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30 mt-2 backdrop-blur-sm">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                      Disponível
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Missão: Perfil Completo */}
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">📝</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">Perfil Completo</p>
                    <p className="text-blue-100 text-sm">Preencha todas as informações</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-300">15</div>
                  <div className="text-blue-100 text-sm">$BØX</div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 mt-2 backdrop-blur-sm">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    Em Progresso
                  </span>
                </div>
              </div>
            </div>

            {/* Missão: Primeira Visualização */}
            <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">👁️</span>
                  </div>
                  <div>
                    <p className="font-bold text-lg">Primeira Visualização</p>
                    <p className="text-blue-100 text-sm">Acompanhe uma prova ao vivo</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-300">30</div>
                  <div className="text-blue-100 text-sm">$BØX</div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-400/30 mt-2 backdrop-blur-sm">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    Bloqueada
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 📊 Progresso do Cadastro */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="mr-2">📊</span>
            Progresso do Cadastro
          </h3>
          <p className="text-green-100 text-sm mb-6">Complete seu perfil para desbloquear mais funcionalidades</p>
          
          <div className="space-y-4">
            {/* Barra de Progresso */}
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${getProfileProgress(userData)}%` 
                }}
              ></div>
            </div>
            
            {/* Itens do Progresso */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{getProfileProgress(userData)}%</div>
                <div className="text-green-100 text-sm">Completo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{getProfileProgress(userData) >= 100 ? '🎉' : '🎯'}</div>
                <div className="text-green-100 text-sm">
                  {getProfileProgress(userData) >= 100 ? 'Perfil 100%' : 'Continue!'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔥 Informações Adicionais */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="text-orange-500 mr-2">🔥</span>
          Informações da Conta
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Nome</span>
            <span className="font-medium text-gray-900">{userData?.displayName || 'Não informado'}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-gray-900">{userData?.email || 'Não informado'}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-600">Função</span>
            <span className="font-medium text-gray-900">{userData?.role || 'Não informado'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Leaderboard Tab - Acessível para todos
function LeaderboardTab({ leaderboardProvas }: { leaderboardProvas: FirestoreTeam[] }) {
  if (leaderboardProvas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🏆</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Resultados em Breve!</h3>
        <p className="text-gray-600 text-lg">
          Os resultados das provas aparecerão aqui em tempo real durante o evento.
        </p>
        <div className="mt-8 text-sm text-gray-500">
          <p>Acompanhe as equipes competindo pelas melhores posições!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">🏆 Leaderboard das Provas</h3>
        <p className="opacity-90">Ranking atualizado em tempo real durante o evento</p>
        <div className="mt-4 text-sm opacity-75">
          <p>🥇 1º Lugar • 🥈 2º Lugar • 🥉 3º Lugar</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Posição
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Pontuação Total
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                Provas Completas
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboardProvas.map((team, index) => {
              const totalPontos = team.competition?.resultados?.reduce((sum, prova) => sum + (prova.pontuacao || 0), 0) || 0
              const provasCount = team.competition?.resultados?.length || 0
               
              return (
                <tr key={team.id} className={`
                  ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}
                  hover:bg-gray-50 transition-colors
                `}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index === 0 && <span className="text-3xl mr-3">🥇</span>}
                      {index === 1 && <span className="text-3xl mr-3">🥈</span>}
                      {index === 2 && <span className="text-3xl mr-3">🥉</span>}
                      <span className={`text-xl font-bold ${
                        index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-gray-600' :
                        index === 2 ? 'text-orange-600' : 'text-gray-900'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-gray-900">
                      {team.nome || 'Time sem nome'}
                    </div>
                    {team.box?.nome && (
                      <div className="text-sm text-gray-600">
                        📍 {team.box.nome} {team.box.cidade && `• ${team.box.cidade}`}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {team.categoria || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-2xl font-bold text-green-600">
                      {totalPontos}
                    </div>
                    <div className="text-sm text-gray-500">pontos</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-blue-600">
                      {provasCount}
                    </div>
                    <div className="text-sm text-gray-500">provas</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Convites Tab - Sistema de convites para espectadores
function ConvitesTab({ userData }: { userData: UserData | null }) {
  if (!userData) return null

  return (
    <TabComingSoonOverlay
      title="Sistema de Convites"
      description="O sistema completo de convites para espectadores estará disponível em breve"
      icon="📧"
    >
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">📧 Sistema de Convites</h3>
        <p className="opacity-90">Convide amigos para participar do evento como espectadores</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">🎫 Convites para Espectadores</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email do Convidado</label>
            <input
              type="email"
              placeholder="amigo@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem (opcional)</label>
            <textarea
              placeholder="Convide seu amigo para assistir ao evento!"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md transition-colors">
            📧 Enviar Convite
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">📊 Histórico de Convites</h4>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-4">📧</div>
          <p>Nenhum convite enviado ainda.</p>
        </div>
      </div>
    </div>
    </TabComingSoonOverlay>
  )
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

// Função para retornar o ícone de BØX baseado no nível
const getBoxIcon = (nivel: 'cindy' | 'helen' | 'fran' | 'annie' | 'murph' | 'matt') => {
  switch (nivel) {
    case 'cindy':
      return '/images/levels/cindy.webp'
    case 'helen':
      return '/images/levels/helen.webp'
    case 'fran':
      return '/images/levels/fran.webp'
    case 'annie':
      return '/images/levels/annie.webp'
    case 'murph':
      return '/images/levels/murph.webp'
    case 'matt':
      return '/images/levels/matt.webp'
    default:
      return '/images/levels/default.webp'
  }
}

// Função para calcular o progresso do perfil
const getProfileProgress = (userData: UserData): number => {
  let progress = 0
  let total = 0
  
  // Nome
  if (userData.displayName) progress += 20
  total += 20
  
  // Email
  if (userData.email) progress += 20
  total += 20
  
  // Foto
  if (userData.photoURL) progress += 30
  total += 30
  
  // Role
  if (userData.role) progress += 15
  total += 15
  
  // Gamification level
  if (userData.gamification?.level) progress += 15
  total += 15
  
  return Math.round((progress / total) * 100)
}

## perfil/admin.tsx

import React, { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import {  db, getAuth } from '../lib/firebase'
import { useAnalytics } from '../hooks/useAnalytics'
import Header from '../components/header'
import Footer from '../components/Footer'
import type { UserRole, FirestoreEvent } from '../types/firestore'
import CotaPromessaManager from '../components/CotaPromessaManager'
import DashboardCharts from '../components/DashboardCharts'
import Pagination from '../components/Pagination'

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type Status = 'ativo' | 'pendente' | 'inativo' | 'cancelado' | 'aprovado' | 'rejeitado'

export type CategoriaPatrocinador = 'Ouro' | 'Prata' | 'Bronze' | 'Apoio' | 'Tecnologia' | 'Alimentação' | 'Equipamentos'

export type AudiovisualTipo = 'fotografo' | 'videomaker' | 'jornalista' | 'influencer' | 'youtuber' | 'outro'

export type CategoriaCompeticao = string

// Interfaces para o dashboard
interface UserData {
  uid: string
  email: string
  role: UserRole
  displayName: string
  photoURL?: string
  gamification?: {
    tokens?: {
      box?: {
        balance?: number
      }
    }
    level?: string
    achievements?: string[]
    totalActions?: number
    challenges?: Array<{
      id: string;
      title: string;
      description: string;
      reward: number;
      completed: boolean;
    }>;
    referralTokens?: number
    rewards?: Array<{
      id: string;
      type: string;
      value: number;
      description: string;
    }>;
    streakDays?: number
  }
}

// Interface para UserBox (compatível com sistema dos perfis)
interface UserBox {
  id: string
  userId: string
  nivel: string
  evento: string
  data: Date
  descricao: string
  pontuacao: number
  categoria: string
  status: string
}

interface DashboardMetrics {
  // Vendas/Checkout
  receitaHoje: number
  pedidosHoje: number
  taxaAprovacao: number
  falhasWebhook24h: number
  
  // Times
  totalTimes: number
  timesCompletos: number
  timesIncompletos: number
  convitesPendentes: number
  taxaAceiteConvites: number
  
  // Gamificação
  acoesHoje: number
  pontosHoje: number
  topLeaderboard: Array<{id: string, nome: string, pontos: number, posicao: number}>
  recompensasResgatadas24h: number
  
  // Talentos
  audiovisualNovos7d: number  // Creators (fotógrafos, videomakers, jornalistas, influencers, youtubers)
  judgeNovos7d: number
  staffNovos7d: number
  espectadorNovos7d: number
  atletaNovos7d: number
  
  // Comunidade
  destaquesPublicados: number
  highlightsSemana: number
  
  // Eventos
  totalEventos: number
  eventosAtivos: number
  eventosFinalizados: number
  participantesTotais: number
}

interface FirestoreDocument {
  id: string
  [key: string]: unknown
}

// Interfaces para dados em tempo real
interface RealTimeData {
  ultimosPedidos: Array<{
    id: string
    amount: number
    status: string
    createdAt: { toDate: () => Date } | Date | string
  }>
  timesIncompletos: Array<{
    id: string
    nome?: string
    name?: string
    members?: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
    }>;
    categoria?: string
  }>
  ultimasAcoes: Array<{
    id: string
    type: string
    points: number
    ts: { toDate: () => Date } | Date | string
  }>
  falhasWebhook: Array<{
    id: string
    level: string
    message: string
    ts: { toDate: () => Date } | Date | string
  }>
}

// ============================================================================
// CONFIGURAÇÕES DAS TABS
// ============================================================================

const ADMIN_TABS = [
  { id: 'overview', label: '📊 Visão Geral', icon: '📊' },
  { id: 'usuarios', label: '👥 Usuários', icon: '👥' },
  { id: 'vendas', label: '💰 Vendas & Checkout', icon: '💰' },
  { id: 'times', label: '🏆 Times & Convites', icon: '🏆' },
  { id: 'gamificacao', label: '🎮 Gamificação ($BOX)', icon: '🎮' },
  { id: 'eventos', label: '📅 Eventos', icon: '📅' },
  { id: 'talentos', label: '🎯 Captação de Talentos', icon: '🎯' },
  { id: 'comunidade', label: '🌟 Comunidade', icon: '🌟' },
  { id: 'operacao', label: '⚙️ Saúde/Operação', icon: '⚙' },
  { id: 'charts', label: '📈 Gráficos', icon: '📈' },
  { id: 'perfil', label: '👤 Perfil & Configurações', icon: '👤' }
] as const

const ADMIN_ROLES: UserRole[] = ['admin', 'marketing', 'dev']

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados para BØX e gamificação
  const [userBoxes, setUserBoxes] = useState(0)
  const [userBoxesDetails, setUserBoxesDetails] = useState<UserBox[]>([])
  const [loadingBoxes, setLoadingBoxes] = useState(false)
  const [userRanking, setUserRanking] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)

  
  // Estados dos dados
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    receitaHoje: 0,
    pedidosHoje: 0,
    taxaAprovacao: 0,
    falhasWebhook24h: 0,
    totalTimes: 0,
    timesCompletos: 0,
    timesIncompletos: 0,
    convitesPendentes: 0,
    taxaAceiteConvites: 0,
    acoesHoje: 0,
    pontosHoje: 0,
    topLeaderboard: [],
    recompensasResgatadas24h: 0,
    audiovisualNovos7d: 0,
    judgeNovos7d: 0,
    staffNovos7d: 0,
    espectadorNovos7d: 0,
    atletaNovos7d: 0,
    destaquesPublicados: 0,
    highlightsSemana: 0,
    totalEventos: 0,
    eventosAtivos: 0,
    eventosFinalizados: 0,
    participantesTotais: 0
  })

  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    ultimosPedidos: [],
    timesIncompletos: [],
    ultimasAcoes: [],
    falhasWebhook: []
  })

  const [apoiadores, setApoiadores] = useState<Array<{
    id: string
    nome: string
    email: string
    telefone: string
    tipo: string
    cota: {
      valor: number
      descricao: string
      status: 'pendente' | 'confirmada' | 'paga'
      dataFechamento: string
      observacoes: string
    }
    promessa: {
      valor: number
      descricao: string
      prazo: string
      status: 'pendente' | 'confirmada' | 'cumprida'
      observacoes: string
    }
    status: string
    dataCadastro: string
  }>>([])

  const { trackPage, trackAdmin } = useAnalytics()

  // ============================================================================
  // FUNÇÕES DE CARREGAMENTO DE DADOS
  // ============================================================================

  // Função genérica para buscar coleção
  const fetchCollection = useCallback(async (collectionName: string): Promise<FirestoreDocument[]> => {
    try {
      const snapshot = await getDocs(collection(db, collectionName))
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error(`Erro ao carregar ${collectionName}:`, error)
      return []
    }
  }, [])

  // Carregar métricas principais
  const loadMetrics = useCallback(async () => {
    try {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      
      const startOfWeek = new Date()
      startOfWeek.setDate(startOfWeek.getDate() - 7)
      
      const nowMinus24h = new Date()
      nowMinus24h.setHours(nowMinus24h.getHours() - 24)

      // Carregar todas as coleções necessárias
      const [
        teams,
        convitesTimes,
        gamificationActions,
        gamificationLeaderboard,
        gamificationCommunityHighlights,
        events,
        audiovisualCandidates,  // Creators (fotógrafos, videomakers, jornalistas, influencers, youtubers)
        judgeCandidates,
        staffCandidates,
        espectadorCandidates,
        atletaCandidates,
        inscricoesImportadas
      ] = await Promise.all([
        fetchCollection('teams'),
        fetchCollection('convites_times'),
        fetchCollection('gamification_actions'),
        fetchCollection('gamification_leaderboard'),
        fetchCollection('gamification_community_highlights'),
        fetchCollection('events'),
        fetchCollection('audiovisual_candidates'),
        fetchCollection('judge_candidates'),
        fetchCollection('staff_candidates'),
        fetchCollection('espectador_candidates'),
        fetchCollection('atleta_candidates'),
        fetchCollection('inscricoes_importadas')
      ])

      // Calcular métricas de vendas das inscrições importadas
      const inscricoesHoje = inscricoesImportadas.filter(inscricao => {
        const dataCriacao = inscricao.data_criacao
        if (dataCriacao && typeof dataCriacao === 'object' && 'toDate' in dataCriacao) {
          return (dataCriacao as { toDate: () => Date }).toDate() >= startOfDay
        }
        if (dataCriacao instanceof Date) {
          return dataCriacao >= startOfDay
        }
        if (typeof dataCriacao === 'string' || typeof dataCriacao === 'number') {
          return new Date(dataCriacao) >= startOfDay
        }
        return false
      })
      
      const inscricoesPagas = inscricoesImportadas.filter(inscricao => 
        inscricao.status_pagamento === 'paid'
      )
      
      const receitaHoje = inscricoesHoje
        .filter(inscricao => inscricao.status_pagamento === 'paid')
        .reduce((acc, inscricao) => {
          const total = inscricao.total
          if (typeof total === 'number') {
            return acc + total
          }
          return acc
        }, 0)
      
      const taxaAprovacao = inscricoesImportadas.length > 0 
        ? (inscricoesPagas.length / inscricoesImportadas.length) * 100 
        : 0

      // Calcular métricas de times
      const timesCompletos = teams.filter(team => {
        const members = team.members
        if (Array.isArray(members)) {
          return members.length === 4
        }
        return false
      }).length
      
      const timesIncompletos = teams.filter(team => {
        const members = team.members
        if (Array.isArray(members)) {
          return members.length < 4
        }
        return false
      }).length
      
      const convitesPendentes = convitesTimes.filter(convite => 
        convite.status === 'pendente'
      ).length
      
      const convitesRespondidos = convitesTimes.filter(convite => 
        convite.status && typeof convite.status === 'string' && 
        ['aceito', 'recusado'].includes(convite.status)
      ).length
      
      const taxaAceiteConvites = convitesTimes.length > 0 
        ? (convitesRespondidos / convitesTimes.length) * 100 
        : 0

      // Calcular métricas de gamificação
      const acoesHoje = gamificationActions.filter(action => {
        const ts = action.ts
        if (ts && typeof ts === 'object' && 'toDate' in ts) {
          return (ts as { toDate: () => Date }).toDate() >= startOfDay
        }
        if (ts instanceof Date) {
          return ts >= startOfDay
        }
        if (typeof ts === 'string' || typeof ts === 'number') {
          return new Date(ts) >= startOfDay
        }
        return false
      })
      
      const pontosHoje = acoesHoje.reduce((acc, action) => {
        const points = action.points
        if (typeof points === 'number') {
          return acc + points
        }
        return acc
      }, 0)
      
      const topLeaderboard = gamificationLeaderboard
        .sort((a, b) => {
          const aPoints = a.points
          const bPoints = b.points
          const aNum = typeof aPoints === 'number' ? aPoints : 0
          const bNum = typeof bPoints === 'number' ? bPoints : 0
          return bNum - aNum
        })
        .slice(0, 10)
        .map((entry, index) => ({
          id: entry.id,
          nome: typeof entry.userName === 'string' ? entry.userName : 'Usuário',
          pontos: typeof entry.points === 'number' ? entry.points : 0,
          posicao: index + 1
        }))

      // Métricas de recompensas removidas - coleção não existe no Firestore
      const recompensasResgatadas24h = 0

      // Calcular métricas de talentos
      // Creators (fotógrafos, videomakers, jornalistas, influencers, youtubers)
      const audiovisualNovos7d = audiovisualCandidates.filter(candidate => {
        const createdAt = candidate.createdAt
        if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
          return (createdAt as { toDate: () => Date }).toDate() >= startOfWeek
        }
        if (createdAt instanceof Date) {
          return createdAt >= startOfWeek
        }
        if (typeof createdAt === 'string' || typeof createdAt === 'number') {
          return new Date(createdAt) >= startOfWeek
        }
        return false
      }).length
      
      const judgeNovos7d = judgeCandidates.filter(candidate => {
        const createdAt = candidate.createdAt
        if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
          return (createdAt as { toDate: () => Date }).toDate() >= startOfWeek
        }
        if (createdAt instanceof Date) {
          return createdAt >= startOfWeek
        }
        if (typeof createdAt === 'string' || typeof createdAt === 'number') {
          return new Date(createdAt) >= startOfWeek
        }
        return false
      }).length
      
      const staffNovos7d = staffCandidates.filter(candidate => {
        const createdAt = candidate.createdAt
        if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
          return (createdAt as { toDate: () => Date }).toDate() >= startOfWeek
        }
        if (createdAt instanceof Date) {
          return createdAt >= startOfWeek
        }
        if (typeof createdAt === 'string' || typeof createdAt === 'number') {
          return new Date(createdAt) >= startOfWeek
        }
        return false
      }).length
      
      const espectadorNovos7d = espectadorCandidates.filter(candidate => {
        const createdAt = candidate.createdAt
        if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
          return (createdAt as { toDate: () => Date }).toDate() >= startOfWeek
        }
        if (createdAt instanceof Date) {
          return createdAt >= startOfWeek
        }
        if (typeof createdAt === 'string' || typeof createdAt === 'number') {
          return new Date(createdAt) >= startOfWeek
        }
        return false
      }).length
      
      const atletaNovos7d = atletaCandidates.filter(candidate => {
        const createdAt = candidate.createdAt
        if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
          return (createdAt as { toDate: () => Date }).toDate() >= startOfWeek
        }
        if (createdAt instanceof Date) {
          return createdAt >= startOfWeek
        }
        if (typeof createdAt === 'string' || typeof createdAt === 'number') {
          return new Date(createdAt) >= startOfWeek
        }
        return false
      }).length

      // Calcular métricas de comunidade
      const destaquesPublicados = gamificationCommunityHighlights.filter(highlight => 
        highlight.isActive === true
      ).length
      
      const highlightsSemana = gamificationCommunityHighlights.filter(highlight => {
        const createdAt = highlight.createdAt
        if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
          return (createdAt as { toDate: () => Date }).toDate() >= startOfWeek
        }
        if (createdAt instanceof Date) {
          return createdAt >= startOfWeek
        }
        if (typeof createdAt === 'string' || typeof createdAt === 'number') {
          return new Date(createdAt) >= startOfWeek
        }
        return false
      }).length

      // Calcular métricas de eventos
      const totalEventos = events.length
      const eventosAtivos = events.filter(event => event.status === 'ativo').length
      const eventosFinalizados = events.filter(event => event.status === 'finalizado').length
      const participantesTotais = events.reduce((total, event) => {
        return total + (Array.isArray(event.participantes) ? event.participantes.length : 0)
      }, 0)

      // Atualizar métricas
      setMetrics({
        receitaHoje,
        pedidosHoje: inscricoesHoje.length,
        taxaAprovacao: Math.round(taxaAprovacao * 100) / 100,
        falhasWebhook24h: 0, // Será atualizado via onSnapshot
        totalTimes: teams.length,
        timesCompletos,
        timesIncompletos,
        convitesPendentes,
        taxaAceiteConvites: Math.round(taxaAceiteConvites * 100) / 100,
        acoesHoje: acoesHoje.length,
        pontosHoje,
        topLeaderboard,
        recompensasResgatadas24h,
        audiovisualNovos7d,
        judgeNovos7d,
        staffNovos7d,
        espectadorNovos7d,
        atletaNovos7d,
        destaquesPublicados,
        highlightsSemana,
        totalEventos,
        eventosAtivos,
        eventosFinalizados,
        participantesTotais
      })

      // Atualizar dados em tempo real
      setRealTimeData(prev => ({
        ...prev,
        ultimosPedidos: inscricoesImportadas
          .sort((a, b) => {
            const aCreatedAt = a.data_criacao
            const bCreatedAt = b.data_criacao
            
            let aTime: Date
            let bTime: Date
            
            if (aCreatedAt && typeof aCreatedAt === 'object' && 'toDate' in aCreatedAt) {
              aTime = (aCreatedAt as { toDate: () => Date }).toDate()
            } else if (aCreatedAt instanceof Date) {
              aTime = aCreatedAt
            } else if (typeof aCreatedAt === 'string' || typeof aCreatedAt === 'number') {
              aTime = new Date(aCreatedAt)
            } else {
              aTime = new Date(0)
            }
            
            if (bCreatedAt && typeof bCreatedAt === 'object' && 'toDate' in bCreatedAt) {
              bTime = (bCreatedAt as { toDate: () => Date }).toDate()
            } else if (bCreatedAt instanceof Date) {
              bTime = bCreatedAt
            } else if (typeof bCreatedAt === 'string' || typeof bCreatedAt === 'number') {
              bTime = new Date(bCreatedAt)
            } else {
              bTime = new Date(0)
            }
            
            return bTime.getTime() - aTime.getTime()
          })
          .slice(0, 20)
          .map(inscricao => ({
            id: (inscricao.id_pedido || inscricao.id || '').toString(),
            amount: typeof inscricao.total === 'number' ? inscricao.total : 0,
            status: typeof inscricao.status_pagamento === 'string' ? inscricao.status_pagamento : 'unknown',
            createdAt: inscricao.data_criacao as string | Date | { toDate: () => Date }
          })),
        timesIncompletos: teams.filter(team => {
          const members = team.members
          if (Array.isArray(members)) {
            return members.length < 4
          }
          return false
        }).map(team => ({
          id: team.id,
          nome: typeof team.nome === 'string' ? team.nome : undefined,
          name: typeof team.name === 'string' ? team.name : undefined,
          members: Array.isArray(team.members) ? team.members : [],
          categoria: typeof team.categoria === 'string' ? team.categoria : undefined
        })),
        ultimasAcoes: acoesHoje.slice(0, 10).map(action => ({
          id: action.id,
          type: typeof action.type === 'string' ? action.type : 'unknown',
          points: typeof action.points === 'number' ? action.points : 0,
          ts: action.ts as string | Date | { toDate: () => Date }
        }))
      }))

    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
    }
  }, [fetchCollection])

  // Carregar BØX do usuário do Firestore
  const loadUserBoxes = useCallback(async (uid: string) => {
    try {
      setLoadingBoxes(true)
      
      // 🔥 INTEGRAÇÃO COM SISTEMA VALIDADO: Buscar dados de gamificação do usuário
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        setUserBoxesDetails([])
        setUserBoxes(0)
        return
      }
      
      const userData = userDoc.data()
      const achievements = userData?.gamification?.achievements || []
      const tokens = userData?.gamification?.tokens?.box?.balance || 0
      const level = userData?.gamification?.level || 'cindy'
      const totalActions = userData?.gamification?.totalActions || 0
      const challenges = userData?.gamification?.challenges || []
      const referralTokens = userData?.gamification?.referralTokens || 0
      const rewards = userData?.gamification?.rewards || []
      const streakDays = userData?.gamification?.streakDays || 0
      
      // 🎯 Definir saldo de $BØX
      setUserBoxes(tokens)
      
      // 🔥 CONVERTER DADOS REAIS EM BØX VISUAIS (SISTEMA VALIDADO)
      const boxes: UserBox[] = []
      
      // 🏆 BØX por achievements específicos (sistema validado)
      if (achievements.includes('primeiro_pagamento')) {
        boxes.push({
          id: 'primeiro_pagamento',
          userId: uid,
          nivel: 'cindy',
          evento: '🏆 Primeiro Pagamento',
          data: new Date(),
          descricao: 'BÔNUS INAUGURAL - Primeira compra realizada na competição',
          pontuacao: 100,
          categoria: 'Pagamento',
          status: 'ativo'
        })
      }
      
      if (achievements.includes('perfil_completo')) {
        boxes.push({
          id: 'perfil_completo',
          userId: uid,
          nivel: 'helen',
          evento: '📋 Perfil Completo',
          data: new Date(),
          descricao: 'PROFILE MASTER - Dados pessoais 100% preenchidos',
          pontuacao: 50,
          categoria: 'Perfil',
          status: 'ativo'
        })
      }

      if (achievements.includes('first_login')) {
        boxes.push({
          id: 'first_login',
          userId: uid,
          nivel: level,
          evento: '🚪 Primeiro Login',
          data: new Date(),
          descricao: 'Bem-vindo à plataforma! Primeiro acesso realizado.',
          pontuacao: 10,
          categoria: 'Login',
          status: 'ativo'
        })
      }

      // 🎯 BØX por nível atual do usuário (sistema validado)
      const nivelBox = {
        'cindy': { nome: 'A Base', pontos: 50, descricao: 'Fundação sólida estabelecida' },
        'helen': { nome: 'O Fôlego', pontos: 100, descricao: 'Resistência cardiovascular dominada' },
        'fran': { nome: 'O Inferno Curto', pontos: 200, descricao: 'Explosão e intensidade conquistadas' },
        'annie': { nome: 'A Coordenação', pontos: 300, descricao: 'Movimentos complexos dominados' },
        'murph': { nome: 'A Prova Final', pontos: 500, descricao: 'Resistência mental e física testadas' },
        'matt': { nome: 'O Escolhido', pontos: 1000, descricao: 'Elite absoluta da comunidade' }
      }

      const nivelInfo = nivelBox[level as keyof typeof nivelBox]
      if (nivelInfo) {
        boxes.push({
          id: `nivel_${level}`,
          userId: uid,
          nivel: level,
          evento: `🏅 ${nivelInfo.nome}`,
          data: new Date(),
          descricao: `NÍVEL ATUAL: ${nivelInfo.descricao}`,
          pontuacao: nivelInfo.pontos,
          categoria: 'Nível',
          status: 'ativo'
        })
      }

      // 🏅 BØX por challenges (sistema validado)
      challenges.forEach((challenge: { name?: string; description?: string; points?: number }, index: number) => {
        boxes.push({
          id: `challenge_${index}`,
          userId: uid,
          nivel: level,
          evento: `🏅 ${challenge.name || `Desafio #${index + 1}`}`,
          data: new Date(),
          descricao: `Desafio concluído: ${challenge.description || 'Desafio da competição'}`,
          pontuacao: challenge.points || 25,
          categoria: 'Desafio',
          status: 'ativo'
        })
      })
      
      // 👥 BØX por referral (sistema validado)
      if (referralTokens > 0) {
        boxes.push({
          id: 'referral_tokens',
          userId: uid,
          nivel: level,
          evento: '👥 Sistema de Referral',
          data: new Date(),
          descricao: `BØX por convidar amigos: ${referralTokens} tokens ganhos`,
          pontuacao: referralTokens,
          categoria: 'Referral',
          status: 'ativo'
        })
      }
      
      // 🔥 BØX por streak (sistema validado)
      if (streakDays > 0) {
        boxes.push({
          id: 'streak_days',
          userId: uid,
          nivel: level,
          evento: '🔥 Sequência de Login',
          data: new Date(),
          descricao: `Sequência de ${streakDays} dias consecutivos de login`,
          pontuacao: streakDays * 5,
          categoria: 'Streak',
          status: 'ativo'
        })
      }
      
      // 🏅 BØX por recompensas (sistema validado)
      rewards.forEach((reward: { name?: string; description?: string; points?: number }, index: number) => {
        boxes.push({
          id: `reward_${index}`,
          userId: uid,
          nivel: level,
          evento: `🏅 Recompensa: ${reward.name || `#${index + 1}`}`,
          data: new Date(),
          descricao: `Recompensa desbloqueada: ${reward.description || 'Recompensa da competição'}`,
          pontuacao: reward.points || 25,
          categoria: 'Recompensa',
          status: 'ativo'
        })
      })
      
      // 🎯 BØX por total de ações (sistema validado)
      if (totalActions > 0) {
        boxes.push({
          id: 'total_acoes',
          userId: uid,
          nivel: level,
          evento: '🎯 Total de Ações',
          data: new Date(),
          descricao: `${totalActions} ações realizadas na plataforma`,
          pontuacao: totalActions,
          categoria: 'Ações',
          status: 'ativo'
        })
      }

      setUserBoxesDetails(boxes)
      
    } catch (error) {
      console.error('Erro ao carregar BØX:', error)
      setUserBoxesDetails([])
      setUserBoxes(0)
    } finally {
      setLoadingBoxes(false)
    }
  }, [])

  // Carregar dados de gamificação do usuário
  const loadUserGamification = useCallback(async (uid: string) => {
    try {
      // Buscar ranking do usuário
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const allUsers = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        boxTokens: doc.data()?.gamification?.tokens?.box?.balance || 0
      }))
      
      // Ordenar por tokens (maior para menor)
      allUsers.sort((a, b) => b.boxTokens - a.boxTokens)
      
      // Encontrar posição do usuário atual
      const userPosition = allUsers.findIndex(user => user.uid === uid)
      setUserRanking(userPosition + 1)
      setTotalUsers(allUsers.length)
      
    } catch (error) {
      console.error('Erro ao carregar gamificação:', error)
    }
  }, [])

  // Carregar dados do usuário
  const loadUserData = useCallback(async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData
        if (!ADMIN_ROLES.includes(userData.role)) {
          window.location.href = '/admin'
          return
        }
        setUserData(userData)
      } else {
        window.location.href = '/admin'
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
      window.location.href = '/admin'
    }
  }, [])

  // Carregar apoiadores
  const loadApoiadores = useCallback(async () => {
    try {
      const apoiadoresRef = collection(db, 'patrocinadores')
      const snapshot = await getDocs(apoiadoresRef)
      
      const apoiadoresData = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          nome: data.nome || 'N/A',
          email: data.email || 'N/A',
          telefone: data.telefone || 'N/A',
          tipo: data.tipo || 'N/A',
          cota: data.cota || {
            valor: 0,
            descricao: '',
            status: 'pendente' as const,
            dataFechamento: '',
            observacoes: ''
          },
          promessa: data.promessa || {
            valor: 0,
            descricao: '',
            prazo: '',
            status: 'pendente' as const,
            observacoes: ''
          },
          status: data.status || 'Ativo',
          dataCadastro: data.dataCadastro || 'N/A'
        }
      })
      
      setApoiadores(apoiadoresData)
    } catch (error) {
      console.error('Erro ao carregar apoiadores:', error)
    }
  }, [])

  // Carregar apoiadores na inicialização
  useEffect(() => {
    loadApoiadores()
  }, [loadApoiadores])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Autenticação
  useEffect(() => {
    const initializeAuth = async () => {
      const auth = await getAuth();
      const { onAuthStateChanged } = await import('firebase/auth');
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUserData(user.uid)
        await loadUserBoxes(user.uid)
        await loadUserGamification(user.uid)
      } else {
        window.location.href = '/login'
      }
      setLoading(false)
    });
    return unsubscribe;
    };

    initializeAuth().then(unsubscribe => {
      if (unsubscribe) {
        return () => unsubscribe();
      }
    });
  }, [loadUserData, loadUserBoxes, loadUserGamification]);

  // Carregar dados após autenticação
  useEffect(() => {
    if (userData && !loading) {
      trackPage('admin-dashboard')
      trackAdmin('view')
      loadMetrics()
    }
  }, [userData, loading, trackPage, trackAdmin, loadMetrics])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleLogout = async () => {
    trackAdmin()
    const auth = await getAuth();
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
    window.location.href = '/'
  }



  // ============================================================================
  // COMPONENTES DE RENDERIZAÇÃO
  // ============================================================================

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-500 mx-auto mb-4"></div>
          <p>Carregando painel admin...</p>
        </div>
      </div>
    )
  }

  // Access denied
  if (!userData || !ADMIN_ROLES.includes(userData.role)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <button
            onClick={() => window.location.href = '/admin'}
            className="bg-gradient-to-r from-pink-600 to-blue-600 hover:from-pink-700 hover:to-blue-700 text-white px-4 py-2 rounded transition-all duration-300"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      {/* Background com imagem principal */}
      <div
        className="flex-1 relative"
        style={{
          backgroundImage: 'url(/images/bg_main.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80"></div>

        {/* Conteúdo principal */}
        <div className="relative z-10 container mx-auto px-4 py-8">
          
          {/* Header do Admin */}
          <AdminHeader userData={userData} onLogout={handleLogout} />

          {/* Tabs */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-8 border border-white/20">
            
            {/* Navigation Tabs */}
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            <TabContent 
              activeTab={activeTab} 
              metrics={metrics} 
              realTimeData={realTimeData}
              userData={userData}
              apoiadores={apoiadores}
              loadApoiadores={loadApoiadores}
              userBoxes={userBoxes}
              userBoxesDetails={userBoxesDetails}
              loadingBoxes={loadingBoxes}
              userRanking={userRanking}
              totalUsers={totalUsers}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

// Wrapper para AdminPerfilTab com funções auxiliares
function AdminPerfilTabWrapper({ 
  userData, 
  userBoxes, 
  userBoxesDetails, 
  loadingBoxes, 
  userRanking, 
  totalUsers 
}: { 
  userData: UserData | null
  userBoxes: number
  userBoxesDetails: UserBox[]
  loadingBoxes: boolean
  userRanking: number
  totalUsers: number
}) {
  // Função para obter ícone baseado no nível
  const getBoxIcon = (nivel: string) => {
    const icones = {
      'cindy': '/images/levels/cindy.webp',
      'helen': '/images/levels/helen.webp', 
      'fran': '/images/levels/fran.webp',
      'annie': '/images/levels/annie.webp',
      'murph': '/images/levels/murph.webp',
      'matt': '/images/levels/matt.webp'
    }
    return icones[nivel as keyof typeof icones] || '/images/levels/default.webp'
  }

  // Função para calcular progresso do perfil
  const getProfileProgress = () => {
    if (!userData) return 0
    
    let completedFields = 0
    const totalFields = 5
    
    if (userData.displayName) completedFields++
    if (userData.email) completedFields++
    if (userData.photoURL) completedFields++
    if (userData.role) completedFields++
    if (userData.gamification?.level) completedFields++
    
    return Math.round((completedFields / totalFields) * 100)
  }

  return (
    <AdminPerfilTab 
      userData={userData}
      userBoxes={userBoxes}
      userBoxesDetails={userBoxesDetails}
      loadingBoxes={loadingBoxes}
      userRanking={userRanking}
      totalUsers={totalUsers}
      getBoxIcon={getBoxIcon}
      getProfileProgress={getProfileProgress}
    />
  )
}

// AdminPerfilTab - Layout iOS-like com sistema BØX integrado
function AdminPerfilTab({ 
  userData, 
  userBoxes, 
  userBoxesDetails, 
  loadingBoxes, 
  userRanking, 
  totalUsers,
  getBoxIcon,
  getProfileProgress 
}: { 
  userData: UserData | null
  userBoxes: number
  userBoxesDetails: UserBox[]
  loadingBoxes: boolean
  userRanking: number
  totalUsers: number
  getBoxIcon: (nivel: string) => string
  getProfileProgress: () => number
}) {
  if (!userData) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando dados do usuário...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 p-6">
      {/* 🎯 Header do Perfil - iOS Style */}
      <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          {/* Avatar e Informações do Usuário */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/20">
              {userData.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-white font-bold text-2xl">
                  {userData.displayName?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-bold">{userData.displayName}</h2>
              <p className="text-purple-100 text-sm flex items-center">
                <span className="mr-1">🚀</span>
                {userData.role?.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Saldo $BØX */}
          <div className="text-right">
            <div className="text-3xl font-bold">{userBoxes}</div>
            <div className="text-purple-100 text-sm">$BØX</div>
          </div>
        </div>
        
        {/* Nível e Ranking */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-purple-100">Seu Nível:</span>
            <div className="bg-white/20 px-4 py-2 rounded-full flex items-center space-x-2">
              <img 
                src={getBoxIcon(userData.gamification?.level || 'cindy')} 
                alt={`Nível ${userData.gamification?.level || 'cindy'}`}
                className="w-6 h-6 object-contain"
              />
              <span className="font-semibold">{userData.gamification?.level || 'Iniciante'}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-purple-100 mb-1">Ranking</div>
            <div className="text-lg font-bold">
              #{userRanking > 0 ? userRanking : 'N/A'}/{totalUsers > 0 ? totalUsers : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 Seção de Conquistas e Missões */}
      <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <span className="mr-2">🏆</span>
            Conquistas & Missões
          </h3>
        </div>
        
        <div className="p-6">
          {/* Conquistas Ativas */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🏆</span>
              Conquistas Ativas
            </h4>
            
            {loadingBoxes ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              </div>
            ) : userBoxesDetails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userBoxesDetails.slice(0, 4).map((box) => (
                  <div key={box.id} className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-800 text-sm">{box.evento}</h5>
                      <span className="text-orange-600 font-bold text-lg">+{box.pontuacao}</span>
                    </div>
                    <p className="text-gray-600 text-xs">{box.descricao}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                      {box.categoria}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 p-4">
                <span className="text-4xl block mb-2">🎯</span>
                Nenhuma conquista encontrada
              </div>
            )}
          </div>

          {/* Missões Pendentes */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Missões Pendentes
            </h4>
            
            <div className="space-y-3">
              {/* Missão: Foto do Perfil */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📸</span>
                  <div>
                    <h5 className="font-semibold text-gray-800">Foto do Perfil</h5>
                    <p className="text-gray-600 text-sm">Adicione uma foto ao seu perfil</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-blue-600 font-bold">+25 $BØX</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    userData.photoURL 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {userData.photoURL ? 'Concluída' : 'Pendente'}
                  </span>
                </div>
              </div>

              {/* Missão: Perfil Completo */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h5 className="font-semibold text-gray-800">Perfil Completo</h5>
                    <p className="text-gray-600 text-sm">Complete todas as informações</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-bold">+15 $BØX</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    Em Progresso
                  </span>
                </div>
              </div>

              {/* Missão: Primeiro Dashboard */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <h5 className="font-semibold text-gray-800">Admin Master</h5>
                    <p className="text-gray-600 text-sm">Use todas as funcionalidades admin</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-purple-600 font-bold">+50 $BØX</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    Bloqueada
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progresso do Cadastro */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Progresso do Cadastro
            </h4>
            
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Completude do Perfil</span>
                <span className="font-bold text-gray-800">{getProfileProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProfileProgress()}%` }}
                ></div>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                {getProfileProgress() === 100 
                  ? '🎉 Perfil 100% completo!' 
                  : `Faltam ${100 - getProfileProgress()}% para completar`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🛠️ Configurações e Gestão */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <span className="mr-2">⚙️</span>
            Configurações Admin
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Gestão de Patrocinadores */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🤝</span>
                <div>
                  <h5 className="font-semibold text-gray-800">Gestão de Patrocinadores</h5>
                  <p className="text-gray-600 text-sm">Gerencie cotas, promessas e benefícios</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Gerenciar
              </button>
            </div>
          </div>

          {/* Relatórios Financeiros */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h5 className="font-semibold text-gray-800">Relatórios Financeiros</h5>
                  <p className="text-gray-600 text-sm">Visualize métricas e projeções</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Visualizar
              </button>
            </div>
          </div>

          {/* Configurações de Sistema */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔧</span>
                <div>
                  <h5 className="font-semibold text-gray-800">Configurações de Sistema</h5>
                  <p className="text-gray-600 text-sm">Webhooks, pagamentos e integrações</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Configurar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AdminHeaderProps {
  userData: UserData
  onLogout: () => void
}

function AdminHeader({ userData, onLogout }: AdminHeaderProps) {
    const roleLabels: Record<UserRole, string> = {
    publico: 'Público',
    atleta: 'Atleta',
           judge: 'Judge',
    midia: 'Mídia',
    admin: 'Admin',
    dev: 'Dev',
    marketing: 'Marketing',
    fotografo: 'Fotógrafo',
    espectador: 'Torcida',
    staff: 'Staff'
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-8 border border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🚀 Dashboard Admin</h1>
          <p className="text-gray-600">Bem-vindo, {userData.displayName} - {roleLabels[userData.role]}</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="bg-gradient-to-r from-pink-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {roleLabels[userData.role]}
          </span>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {ADMIN_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-pink-500 to-blue-600 text-white shadow-lg'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

interface TabContentProps {
  activeTab: string
  metrics: DashboardMetrics
  realTimeData: RealTimeData
  userData: UserData | null
  apoiadores: Array<{
    id: string
    nome: string
    email: string
    telefone: string
    tipo: string
    cota: {
      valor: number
      descricao: string
      status: 'pendente' | 'confirmada' | 'paga'
      dataFechamento: string
      observacoes: string
    }
    promessa: {
      valor: number
      descricao: string
      prazo: string
      status: 'pendente' | 'confirmada' | 'cumprida'
      observacoes: string
    }
    status: string
    dataCadastro: string
  }>
  loadApoiadores: () => Promise<void>
}

function TabContent({ 
  activeTab, 
  metrics, 
  realTimeData, 
  userData, 
  apoiadores, 
  loadApoiadores,
  userBoxes,
  userBoxesDetails,
  loadingBoxes,
  userRanking,
  totalUsers
}: TabContentProps & {
  userBoxes: number
  userBoxesDetails: UserBox[]
  loadingBoxes: boolean
  userRanking: number
  totalUsers: number
}) {
  switch (activeTab) {
    case 'overview':
      return <OverviewTab metrics={metrics} realTimeData={realTimeData} />
    case 'usuarios':
      return <UsuariosTab />
    case 'vendas':
      return <VendasTab metrics={metrics} realTimeData={realTimeData} />
    case 'times':
      return <TimesTab metrics={metrics} realTimeData={realTimeData} />
    case 'gamificacao':
      return <GamificacaoTab metrics={metrics} realTimeData={realTimeData} />
    case 'eventos':
      return <EventosTab metrics={metrics} />
    case 'talentos':
      return <TalentosTab metrics={metrics} realTimeData={realTimeData} />
    case 'comunidade':
      return <ComunidadeTab metrics={metrics} realTimeData={realTimeData} />
    case 'operacao':
      return <OperacaoTab metrics={metrics} realTimeData={realTimeData} />
    case 'charts':
      return <ChartsTab />
    case 'perfil':
      return (
        <AdminPerfilTabWrapper 
          userData={userData} 
          userBoxes={userBoxes}
          userBoxesDetails={userBoxesDetails}
          loadingBoxes={loadingBoxes}
          userRanking={userRanking}
          totalUsers={totalUsers}
        />
      )
    case 'apoiadores':
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🤝 Gestão de Apoiadores</h3>
            <CotaPromessaManager apoiadores={apoiadores} onReload={loadApoiadores} />
          </div>
        </div>
      )
    default:
      return <OverviewTab metrics={metrics} realTimeData={realTimeData} />
  }
}

// ============================================================================
// TABS DE CONTEÚDO
// ============================================================================

// Charts Tab
function ChartsTab() {
  const [users, setUsers] = useState<Array<{
    id: string;
    role?: string;
    box?: string;
    status?: string;
  }>>([]);
  const [teams, setTeams] = useState<Array<{
    id: string;
    categoria?: string;
    status?: string;
    createdAt?: Date | string;
  }>>([]);
  const [parceiros, setParceiros] = useState<Array<{
    id: string;
    tipo?: 'Patrocinador' | 'Apoiador';
    categoria?: string;
    status?: string;
    cota?: { valor?: number };
    beneficio?: { valorEstimado?: number };
  }>>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados para os gráficos
  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        
        // Carregar usuários
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const usersData = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            role: data.role || 'N/A',
            box: data.box || 'N/A',
            status: data.status || 'Ativo'
          };
        });
        setUsers(usersData);

        // Carregar times
        const teamsRef = collection(db, 'teams');
        const teamsSnapshot = await getDocs(teamsRef);
        const teamsData = teamsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            categoria: data.categoria || 'N/A',
            status: data.status || 'incomplete',
            createdAt: data.createdAt || new Date()
          };
        });
        setTeams(teamsData);

        // Carregar parceiros
        const parceirosRef = collection(db, 'patrocinadores');
        const parceirosSnapshot = await getDocs(parceirosRef);
        const parceirosData = parceirosSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            tipo: data.tipo || 'N/A',
            categoria: data.categoria || 'N/A',
            status: data.status || 'ativo',
            cota: data.cota || { valor: 0 },
            beneficio: data.beneficio || { valorEstimado: 0 }
          };
        });
        setParceiros(parceirosData);

      } catch (error) {
        console.error('Erro ao carregar dados para gráficos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando dados para gráficos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Análises Visuais - Admin Dashboard</h2>
      <DashboardCharts users={users} teams={teams} parceiros={parceiros} />
    </div>
  );
}

function OverviewTab({ metrics }: { metrics: DashboardMetrics; realTimeData: RealTimeData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Visão Geral - KPIs Principais</h2>
      
      {/* Header Strip - Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard
          title="Receita Hoje"
          value={`R$ ${metrics.receitaHoje.toLocaleString()}`}
          icon="💰"
          color="green"
        />
        <MetricCard
          title="Pedidos Hoje"
          value={metrics.pedidosHoje.toString()}
          icon="📦"
          color="blue"
        />
        <MetricCard
          title="Times Completos"
          value={metrics.timesCompletos.toString()}
          icon="🏆"
          color="purple"
        />
        <MetricCard
          title="Ações $BOX Hoje"
          value={metrics.acoesHoje.toString()}
          icon="🎮"
          color="pink"
        />
        <MetricCard
          title="Falhas Webhook (24h)"
          value={metrics.falhasWebhook24h.toString()}
          icon="⚠️"
          color="red"
        />
      </div>

      {/* Métricas Secundárias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Taxa de Aprovação"
          value={`${metrics.taxaAprovacao}%`}
          icon="✅"
          color="green"
        />
        <MetricCard
          title="Times Incompletos"
          value={metrics.timesIncompletos.toString()}
          icon="⏳"
          color="yellow"
        />
        <MetricCard
          title="Convites Pendentes"
          value={metrics.convitesPendentes.toString()}
          icon="📨"
          color="orange"
        />
        <MetricCard
          title="Taxa Aceite Convites"
          value={`${metrics.taxaAceiteConvites}%`}
          icon="🤝"
          color="blue"
        />
        <MetricCard
          title="Pontos $BOX Hoje"
          value={metrics.pontosHoje.toLocaleString()}
          icon=""
          color="purple"
        />
        <MetricCard
          title="Recompensas (24h)"
          value={metrics.recompensasResgatadas24h.toString()}
          icon="🎁"
          color="pink"
        />
      </div>

      {/* Métricas de Eventos */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Eventos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total de Eventos"
            value={metrics.totalEventos.toString()}
            icon="📅"
            color="blue"
          />
          <MetricCard
            title="Eventos Ativos"
            value={metrics.eventosAtivos.toString()}
            icon="🔴"
            color="green"
          />
          <MetricCard
            title="Eventos Finalizados"
            value={metrics.eventosFinalizados.toString()}
            icon="✅"
            color="purple"
          />
          <MetricCard
            title="Total de Participantes"
            value={metrics.participantesTotais.toString()}
            icon="👥"
            color="orange"
          />
        </div>
      </div>

      {/* Top 10 Leaderboard de Gamificação */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">🏆 Top 10 Ranking de Gamificação $BOX</h3>
        <p className="text-sm text-gray-600 mb-4">Usuários com mais tokens $BOX por engajamento na plataforma (não relacionado à competição)</p>
        <div className="space-y-3">
          {metrics.topLeaderboard.map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-4">
                <span className={`text-2xl ${index < 3 ? 'animate-bounce' : ''}`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </span>
                <span className="font-medium text-gray-800">{entry.nome}</span>
              </div>
              <span className="text-lg font-bold text-pink-600">{entry.pontos.toLocaleString()} $BOX</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ✅ Nova aba de Usuários com coluna $BOX
function UsuariosTab() {
  const [users, setUsers] = useState<Array<{
    id: string
    email: string
    role: string
    status: string
    box: string
    boxTokens: number
    displayName?: string
    paymentStatus: string
    hasPaid: boolean
    teamInfo?: {
      teamName: string
      isCaptain: boolean
      teamId: string
    }
  }>>([])
  const [loading, setLoading] = useState(true)
  
  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'boxTokens' | 'displayName' | 'email'>('boxTokens')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Carregar usuários com dados de gamificação
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        
        // Carregar usuários principais
        const usersRef = collection(db, 'users')
        const usersSnapshot = await getDocs(usersRef)
        
        // Carregar candidatos para verificar pagamentos e times
        const [
          audiovisualSnapshot,
          judgeSnapshot,
          staffSnapshot,
          espectadorSnapshot,
          atletaSnapshot,
          teamsSnapshot
        ] = await Promise.all([
          getDocs(collection(db, 'audiovisual_candidates')),
          getDocs(collection(db, 'judge_candidates')),
          getDocs(collection(db, 'staff_candidates')),
          getDocs(collection(db, 'espectador_candidates')),
          getDocs(collection(db, 'atleta_candidates')),
          getDocs(collection(db, 'teams'))
        ])
        
        // Criar mapa de pagamentos por email
        const paymentMap = new Map<string, { status: string; hasPaid: boolean }>()
        
        // Criar mapa de times por email do usuário
        const teamMap = new Map<string, { teamName: string; isCaptain: boolean; teamId: string }>()
        
        // Mapear times
        teamsSnapshot.docs.forEach(doc => {
          const team = doc.data()
          if (team.members && Array.isArray(team.members)) {
            team.members.forEach((member: { email?: string; isCaptain?: boolean; role?: string }) => {
              if (member.email) {
                teamMap.set(member.email, {
                  teamName: team.nome || team.name || 'Time sem nome',
                  isCaptain: member.isCaptain === true || member.role === 'captain',
                  teamId: doc.id
                })
              }
            })
          }
        })
        
        // Mapear candidatos audiovisual
        audiovisualSnapshot.docs.forEach(doc => {
          const candidate = doc.data()
          if (candidate.email) {
            paymentMap.set(candidate.email, {
              status: candidate.paymentStatus || 'Pendente',
              hasPaid: candidate.paymentStatus === 'completed' || candidate.paymentStatus === 'paid'
            })
          }
        })
        
        // Mapear candidatos judge
        judgeSnapshot.docs.forEach(doc => {
          const candidate = doc.data()
          if (candidate.email) {
            paymentMap.set(candidate.email, {
              status: candidate.paymentStatus || 'Pendente',
              hasPaid: candidate.paymentStatus === 'completed' || candidate.paymentStatus === 'paid'
            })
          }
        })
        
        // Mapear candidatos staff
        staffSnapshot.docs.forEach(doc => {
          const candidate = doc.data()
          if (candidate.email) {
            paymentMap.set(candidate.email, {
              status: candidate.paymentStatus || 'Pendente',
              hasPaid: candidate.paymentStatus === 'completed' || candidate.paymentStatus === 'paid'
            })
          }
        })
        
        // Mapear candidatos espectador
        espectadorSnapshot.docs.forEach(doc => {
          const candidate = doc.data()
          if (candidate.email) {
            paymentMap.set(candidate.email, {
              status: candidate.paymentStatus || 'Pendente',
              hasPaid: candidate.paymentStatus === 'completed' || candidate.paymentStatus === 'paid'
            })
          }
        })
        
        // Mapear candidatos atleta
        atletaSnapshot.docs.forEach(doc => {
          const candidate = doc.data()
          if (candidate.email) {
            paymentMap.set(candidate.email, {
              status: candidate.paymentStatus || 'Pendente',
              hasPaid: candidate.paymentStatus === 'completed' || candidate.paymentStatus === 'paid'
            })
          }
        })
        
        const usersData = usersSnapshot.docs.map(doc => {
          const data = doc.data()
          const email = data.email || 'N/A'
          const paymentInfo = paymentMap.get(email) || { status: 'Não Pago', hasPaid: false }
          const teamInfo = teamMap.get(email)
          
          return {
            id: doc.id,
            email,
            role: data.role || 'N/A',
            status: data.status || 'Ativo',
            box: data.box || 'N/A',
            boxTokens: data.gamification?.tokens?.box || 0,
            displayName: data.displayName || 'N/A',
            paymentStatus: paymentInfo.status,
            hasPaid: paymentInfo.hasPaid,
            teamInfo
          }
        })

        // Ordenar por tokens $BOX (maior para menor)
        usersData.sort((a, b) => b.boxTokens - a.boxTokens)
        setUsers(usersData)
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  // Funções de filtro e paginação
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      (user.displayName?.toLowerCase().includes(searchLower) || false) ||
      user.email.toLowerCase().includes(searchLower)
    )
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]
    
    if (sortBy === 'boxTokens') {
      aValue = Number(aValue) || 0
      bValue = Number(bValue) || 0
    } else {
      aValue = String(aValue || '').toLowerCase()
      bValue = String(bValue || '').toLowerCase()
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage)
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="dashboard-ios ios-fade-in">
      <div className="ios-header">
        <h2>👥 Gestão de Usuários</h2>
        <p>Gerencie usuários, visualize métricas e acompanhe o engajamento</p>
      </div>
      
      {/* KPIs de Usuários */}
      <div className="ios-metric-grid">
        <div className="ios-metric-card">
          <span className="ios-metric-icon">👥</span>
          <div className="ios-metric-value">{users.length}</div>
          <div className="ios-metric-label">Total de Usuários</div>
        </div>
        
        <div className="ios-metric-card">
          <span className="ios-metric-icon">✅</span>
          <div className="ios-metric-value">{users.filter(u => u.status === 'Ativo').length}</div>
          <div className="ios-metric-label">Usuários Ativos</div>
        </div>
        
        <div className="ios-metric-card">
          <span className="ios-metric-icon">💰</span>
          <div className="ios-metric-value">{users.filter(u => u.hasPaid).length}</div>
          <div className="ios-metric-label">Usuários Pagos</div>
        </div>
        
        <div className="ios-metric-card">
          <span className="ios-metric-icon">🎯</span>
          <div className="ios-metric-value">{users.reduce((sum, u) => sum + u.boxTokens, 0).toLocaleString()}</div>
          <div className="ios-metric-label">Total $BOX</div>
        </div>
        
        <div className="ios-metric-card">
          <span className="ios-metric-icon">📊</span>
          <div className="ios-metric-value">{users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.boxTokens, 0) / users.length) : 0}</div>
          <div className="ios-metric-label">Média $BOX/Usuário</div>
        </div>
      </div>

      {/* Controles de Filtro e Ordenação */}
      <div className="ios-card ios-card-spacious ios-mb-lg">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Busca */}
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ios-input"
            />
          </div>
          
          {/* Ordenação */}
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'boxTokens' | 'displayName' | 'email')}
              className="ios-select"
            >
              <option value="boxTokens">Ordenar por $BOX</option>
              <option value="displayName">Ordenar por Nome</option>
              <option value="email">Ordenar por Email</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="ios-btn ios-btn-secondary"
            >
              {sortOrder === 'asc' ? '↑ Crescente' : '↓ Decrescente'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="ios-card">
        <div className="ios-header">
          <h3>📋 Lista de Usuários</h3>
          <p>Usuários ordenados por quantidade de tokens $BOX</p>
        </div>
        
        {loading ? (
          <div className="ios-card-compact ios-text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="ios-mt-sm ios-text-secondary">Carregando usuários...</p>
          </div>
        ) : (
          <div className="ios-table-container">
            <table className="ios-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Tipo</th>
                  <th>Box</th>
                  <th>$BOX Tokens</th>
                  <th>PGTO</th>
                  <th>Time/Capitão</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user, index) => (
                  <tr key={user.id} className={index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                        {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                        {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`ios-badge ${
                        user.role === 'atleta' ? 'ios-badge-info' :
                        user.role === 'judge' ? 'ios-badge-secondary' :
                        user.role === 'midia' ? 'ios-badge-success' :
                        user.role === 'espectador' ? 'ios-badge-warning' :
                        'ios-badge-info'
                      }`}>
                        {user.role === 'atleta' ? '🏃 Atleta' :
                         user.role === 'judge' ? '⚖️ Judge' :
                         user.role === 'midia' ? '📸 Mídia' :
                         user.role === 'espectador' ? '👥 Torcida' :
                         user.role}
                      </span>
                    </td>
                    <td>
                      <span className="ios-badge ios-badge-info">
                        {user.box ? String(user.box) : 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="ios-metric-value" style={{ fontSize: '18px', color: 'var(--ios-accent)' }}>
                        {user.boxTokens.toLocaleString()} $BOX
                      </span>
                    </td>
                    <td>
                      <span className={`ios-badge ${
                        user.hasPaid ? 'ios-badge-success' : 'ios-badge-warning'
                      }`}>
                        {user.paymentStatus}
                      </span>
                    </td>
                    <td>
                      {user.role === 'atleta' && user.teamInfo ? (
                        <div className="text-center">
                          <div className="text-sm font-medium text-blue-600">
                            {user.teamInfo.teamName}
                          </div>
                          {user.teamInfo.isCaptain && (
                            <div className="text-xs text-yellow-600 font-bold">
                              👑 Capitão
                            </div>
                          )}
                        </div>
                      ) : user.role === 'atleta' ? (
                        <span className="text-xs text-gray-500">Sem time</span>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td>
                      <span className={`ios-badge ${
                        user.status === 'Ativo' ? 'ios-badge-success' :
                        user.status === 'Inativo' ? 'ios-badge-error' :
                        'ios-badge-info'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Paginação */}
        {!loading && totalPages > 1 && (
          <div className="p-6 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={sortedUsers.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function VendasTab({ metrics, realTimeData }: { metrics: DashboardMetrics; realTimeData: RealTimeData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">💰 Vendas & Checkout (FlowPay)</h2>
      
      {/* KPIs de Vendas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Receita Confirmada (R$)"
          value={`R$ ${metrics.receitaHoje.toLocaleString()}`}
          icon="💰"
          color="green"
        />
        <MetricCard
          title="Pedidos do Dia"
          value={metrics.pedidosHoje.toString()}
          icon="📦"
          color="blue"
        />
        <MetricCard
          title="Taxa de Aprovação"
          value={`${metrics.taxaAprovacao}%`}
          icon="✅"
          color="green"
        />
      </div>

      {/* Últimos Pedidos */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🔄 Últimos 20 Pedidos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                             {realTimeData.ultimosPedidos?.slice(0, 20).map((pedido, index: number) => (
                <tr key={pedido.id || index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{pedido.id?.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    R$ {(pedido.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={pedido.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {(() => {
                      const createdAt = pedido.createdAt
                      if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
                        return (createdAt as { toDate: () => Date }).toDate().toLocaleDateString()
                      }
                      if (createdAt instanceof Date) {
                        return createdAt.toLocaleDateString()
                      }
                      if (typeof createdAt === 'string' || typeof createdAt === 'number') {
                        return new Date(createdAt).toLocaleDateString()
                      }
                      return 'N/A'
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function TimesTab({ metrics, realTimeData }: { metrics: DashboardMetrics; realTimeData: RealTimeData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 Times & Convites</h2>
      
      {/* KPIs de Times */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total de Times"
          value={metrics.totalTimes.toString()}
          icon="🏆"
          color="blue"
        />
        <MetricCard
          title="Times Completos"
          value={metrics.timesCompletos.toString()}
          icon="✅"
          color="green"
        />
        <MetricCard
          title="Times Incompletos"
          value={metrics.timesIncompletos.toString()}
          icon="⏳"
          color="yellow"
        />
        <MetricCard
          title="Convites Pendentes"
          value={metrics.convitesPendentes.toString()}
          icon="📨"
          color="orange"
        />
      </div>

      {/* Times Incompletos */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">⏳ Times Incompletos (Precisam de Atletas)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {realTimeData.timesIncompletos?.slice(0, 12).map((time, index: number) => (
            <div key={time.id || index} className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800">{time.nome || time.name || 'Time sem nome'}</h4>
              <p className="text-sm text-gray-600">
                Membros: {(time.members?.length || 0)}/4
              </p>
              <p className="text-sm text-gray-500">
                Categoria: {time.categoria || 'N/A'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function GamificacaoTab({ metrics }: { metrics: DashboardMetrics; realTimeData: RealTimeData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🎮 Gamificação ($BOX Tokens)</h2>
      
      {/* KPIs de Gamificação */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Ações Hoje"
          value={metrics.acoesHoje.toString()}
          icon="🎯"
          color="blue"
        />
        <MetricCard
          title="Pontos Hoje"
          value={metrics.pontosHoje.toLocaleString()}
          icon="⭐"
          color="yellow"
        />
        <MetricCard
          title="Recompensas (24h)"
          value={metrics.recompensasResgatadas24h.toString()}
          icon="🎁"
          color="purple"
        />
        <MetricCard
          title="Destaques Ativos"
          value={metrics.destaquesPublicados.toString()}
          icon="🌟"
          color="pink"
        />
      </div>

      {/* Top 10 Leaderboard */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Top 10 Leaderboard $BOX</h3>
        <div className="space-y-3">
          {metrics.topLeaderboard.map((entry, index) => (
            <div key={entry.id} className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-4">
                <span className={`text-2xl ${index < 3 ? 'animate-bounce' : ''}`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </span>
                <span className="font-medium text-gray-800">{entry.nome}</span>
              </div>
              <span className="text-lg font-bold text-pink-600">{entry.pontos.toLocaleString()} $BOX</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TalentosTab({ metrics }: { metrics: DashboardMetrics; realTimeData: RealTimeData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🎯 Captação de Talentos (Últimos 7 dias)</h2>
      
      {/* KPIs de Talentos */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <MetricCard
          title="Creators"
          value={metrics.audiovisualNovos7d.toString()}
          icon="🎬"
          color="blue"
        />
        <MetricCard
          title="Judges"
          value={metrics.judgeNovos7d.toString()}
          icon="⚖️"
          color="purple"
        />
        <MetricCard
          title="Staff"
          value={metrics.staffNovos7d.toString()}
          icon="👷"
          color="green"
        />
        <MetricCard
          title="Espectadores"
          value={metrics.espectadorNovos7d.toString()}
          icon="👀"
          color="orange"
        />
        <MetricCard
          title="Atletas"
          value={metrics.atletaNovos7d.toString()}
          icon="🏃"
          color="red"
        />
      </div>

      {/* Pipeline de Talentos */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Pipeline de Captação</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">🎬 Creators</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">{metrics.audiovisualNovos7d}</span>
              <span className="text-sm text-gray-500">candidatos</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">⚖️ Judges</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-purple-600">{metrics.judgeNovos7d}</span>
              <span className="text-sm text-gray-500">candidatos</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">👷 Staff</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-green-600">{metrics.staffNovos7d}</span>
              <span className="text-sm text-gray-500">candidatos</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">👀 Espectadores</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-orange-600">{metrics.espectadorNovos7d}</span>
              <span className="text-sm text-gray-500">candidatos</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">🏃 Atletas</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-red-600">{metrics.atletaNovos7d}</span>
              <span className="text-sm text-gray-500">candidatos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ComunidadeTab({ metrics }: { metrics: DashboardMetrics; realTimeData: RealTimeData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🌟 Comunidade & Conteúdo</h2>
      
      {/* KPIs de Comunidade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Destaques Publicados"
          value={metrics.destaquesPublicados.toString()}
          icon="🌟"
          color="pink"
        />
        <MetricCard
          title="Highlights da Semana"
          value={metrics.highlightsSemana.toString()}
          icon="📸"
          color="blue"
        />
        <MetricCard
          title="Engajamento $BOX"
          value={`${metrics.pontosHoje.toLocaleString()} pts`}
          icon="🎯"
          color="purple"
        />
      </div>

      {/* Estatísticas de Engajamento */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Estatísticas de Engajamento</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Ações de Gamificação Hoje</span>
            <span className="text-2xl font-bold text-blue-600">{metrics.acoesHoje}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Pontos $BOX Gerados</span>
            <span className="text-2xl font-bold text-yellow-600">{metrics.pontosHoje.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Recompensas Resgatadas (24h)</span>
            <span className="text-2xl font-bold text-purple-600">{metrics.recompensasResgatadas24h}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function OperacaoTab({ metrics }: { metrics: DashboardMetrics; realTimeData: RealTimeData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Saúde/Operação</h2>
      
      {/* KPIs de Operação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Falhas Webhook (24h)"
          value={metrics.falhasWebhook24h.toString()}
          icon="⚠️"
          color="red"
        />
        <MetricCard
          title="Taxa de Aprovação"
          value={`${metrics.taxaAprovacao}%`}
          icon="✅"
          color="green"
        />
        <MetricCard
          title="Times Incompletos"
          value={metrics.timesIncompletos.toString()}
          icon="⏳"
          color="yellow"
        />
      </div>

      {/* Alertas e Recomendações */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🚨 Alertas e Recomendações</h3>
        <div className="space-y-4">
          {metrics.taxaAprovacao < 70 && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
              <strong>⚠️ Taxa de Aprovação Baixa:</strong> {metrics.taxaAprovacao}% - Revisar cópia/CTA, testar banner "PIX em 30s"
            </div>
          )}
          
          {metrics.timesIncompletos > 10 && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
              <strong>📢 Times Incompletos:</strong> {metrics.timesIncompletos} times precisam de atletas - Acionar "Arena & Times"
            </div>
          )}
          
          {metrics.falhasWebhook24h > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <strong>🚨 Falhas de Webhook:</strong> {metrics.falhasWebhook24h} falhas nas últimas 24h - Verificar logs e reprocessar
            </div>
          )}
          
          {metrics.acoesHoje > 100 && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              <strong>🎉 Pico de Gamificação:</strong> {metrics.acoesHoje} ações hoje - Repost imediato no IG/Stories
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// EventosTab
function EventosTab({ metrics }: { metrics: DashboardMetrics }) {
  const [events, setEvents] = useState<FirestoreEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        const eventsRef = collection(db, 'events')
        const eventsSnapshot = await getDocs(eventsRef)
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirestoreEvent[]
        setEvents(eventsData)
      } catch (error) {
        console.error('Erro ao carregar eventos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-500 mx-auto mb-4"></div>
        <p>Carregando eventos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Eventos"
          value={metrics.totalEventos.toString()}
          icon="📅"
          color="blue"
        />
        <MetricCard
          title="Eventos Ativos"
          value={metrics.eventosAtivos.toString()}
          icon="🔴"
          color="green"
        />
        <MetricCard
          title="Eventos Finalizados"
          value={metrics.eventosFinalizados.toString()}
          icon="✅"
          color="purple"
        />
        <MetricCard
          title="Total de Participantes"
          value={metrics.participantesTotais.toString()}
          icon="👥"
          color="pink"
        />
      </div>

      {/* Lista de Eventos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">📅 Eventos</h3>
        </div>
        
        {events.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-500">Ainda não há eventos cadastrados no sistema.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organizador
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((evento) => (
                  <tr key={evento.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {evento.nome || 'Evento sem nome'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evento.data ? 
                        (typeof evento.data === 'object' && 'toDate' in evento.data 
                          ? (evento.data as { toDate: () => Date }).toDate().toLocaleDateString()
                          : new Date(evento.data as Date).toLocaleDateString()
                        ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {evento.categoria || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded text-xs ${
                        evento.status === 'ativo' ? 'bg-green-100 text-green-800' :
                        evento.status === 'finalizado' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {evento.status || 'indefinido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evento.participantes ? evento.participantes.length : 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {evento.organizador || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL DO DASHBOARD
// ============================================================================

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface MetricCardProps {
  title: string
  value: string
  icon: string
  color: 'green' | 'blue' | 'purple' | 'pink' | 'yellow' | 'orange' | 'red'
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    pink: 'bg-pink-100 text-pink-800 border-pink-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    red: 'bg-red-100 text-red-800 border-red-200'
  }

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]} transition-all duration-200 hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    paid: { label: 'Pago', color: 'bg-green-100 text-green-800' },
    approved: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
    completed: { label: 'Completo', color: 'bg-green-100 text-green-800' },
    pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    failed: { label: 'Falhou', color: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  )
}

## perfil/dev.tsx

import { useState, useEffect, useCallback, useRef } from 'react'
import { getAuth } from '../lib/firebase'
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import {  db, storage  } from '../lib/firebase'
import { useAnalytics } from '../hooks/useAnalytics'
import Header from '../components/header'
import Footer from '../components/Footer'
import PatrocinadoresDashboard from '../components/PatrocinadoresDashboard'
import DashboardCharts from '../components/DashboardCharts'
import type { UserRole } from '../types/firestore';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type Status = 'ativo' | 'pendente' | 'inativo' | 'cancelado' | 'aprovado' | 'rejeitado'
export type CategoriaPatrocinador = 'Ouro' | 'Prata' | 'Bronze' | 'Apoio'
export type AudiovisualTipo = 'fotografo' | 'videomaker' | 'jornalista' | 'influencer' | 'youtuber' | 'outro'
export type CategoriaCompeticao = 'Amador' | 'Iniciante' | 'Scaled' | 'Master 145+' | 'RX' 

// Interface para BØX do usuário (CORRIGIDA para usar níveis válidos)
interface UserBox extends FirestoreDocument {
  userId: string
  nivel: 'cindy' | 'helen' | 'fran' | 'annie' | 'murph' | 'matt' // Níveis validados
  evento: string
  data: Date
  descricao?: string
  pontuacao?: number
  categoria?: string
  imagem?: string
  status: 'ativo' | 'inativo' | 'pendente'
}

interface UserData {
  uid: string
  email: string
  role: UserRole
  displayName: string
  profilePhoto?: string
  photoURL?: string
}

interface Stats {
  totalUsers: number
  totalTeams: number
  totalAudiovisual: number
  totalAtletas: number
  totalParceiros: number
  totalPatrocinadores: number
  faturamentoTotal: number
  receitaPorLote: Record<string, number>
  receitaPorCategoria: Record<string, number>
  receitaPorGateway: Record<string, number>
  ticketMedioPorTime: number
  upsellsVendidos: Record<string, number>
}



interface GamificationStats {
  totalUsers: number
  activeUsers: number
  totalPoints: number
  averagePoints: number
  topUsers: Array<{
    userId: string
    userName: string
    points: number
    level: string
  }>
  achievementsUnlocked: number
  rewardsRedeemed: number
  engagementRate: number
}

interface MarketingStats {
  conversionRate: number
  userEngagement: number
  topUserTypes: string[]
  campaignPerformance: Record<string, number>
  salesMetrics: {
    totalRevenue: number
    averageTicket: number
    conversionFunnel: Record<string, number>
  }
}

interface FirestoreDocument {
  id: string
  [key: string]: unknown
}

interface FirestoreUser extends FirestoreDocument {
  displayName?: string
  email?: string
  role?: UserRole
  status?: Status
  migration_source?: string
  gamification?: {
    tokens?: {
      box?: {
        balance?: number
        totalEarned?: number
        totalSpent?: number
      }
    }
  }
  teamInfo?: {
    teamName: string
    isCaptain: boolean
    teamId: string
    slot: number
  }
}

interface FirestoreTeam extends FirestoreDocument {
  nome?: string
  name?: string
  categoria?: CategoriaCompeticao
  captainId?: string
  atletas?: string[]
  members?: Array<{
    slot: number
    uid?: string
    email?: string
    status: 'pending' | 'active' | 'inactive'
    role?: 'atleta' | 'captain'
    joinedAt?: Date
  }>
  status?: 'incomplete' | 'complete' | 'confirmado' | 'cancelado'
  openSlots?: number
  box?: {
    nome?: string
    cidade?: string
  }
  competition?: {
    resultados?: Array<{
      pontuacao: number
    }>
  }
}

// Interface FirestoreAudiovisual removida - não mais utilizada

interface FirestorePatrocinador extends FirestoreDocument {
  nome?: string
  nomeFantasia?: string
  categoria?: CategoriaPatrocinador
  valorPatrocinio?: string
  status?: Status
}

// Interface para convites de times
interface FirestoreTeamInvite extends FirestoreDocument {
  teamId: string
  teamName?: string
  captainId?: string
  invitedEmail?: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  createdAt: Date
  expiresAt?: Date
  slot?: number
  code?: string
}

// ============================================================================
// CONFIGURAÇÕES DAS TABS
// ============================================================================

const DEV_TABS = [
  { id: 'overview', label: 'Visão Geral', icon: '⧕' },
  { id: 'usuarios', label: 'Usuários', icon: '▞' },
  { id: 'patrocinadores', label: 'Gestão de Patrocinadores', icon: '▟' },
  { id: 'analises', label: 'Análises Técnicas', icon: '✜' },
  { id: 'monitoramento', label: 'Monitoramento do Sistema', icon: '❱' },
  { id: 'cotas', label: 'Gestão de Cotas e Promessas', icon: '֍' },
  { id: 'charts', label: 'Gráficos', icon: '↯' },
  { id: 'operacao', label: 'Saúde/Operação', icon: '⌘' },
  { id: 'comunidade', label: 'Comunidade', icon: '⧑' },
  { id: 'talentos', label: 'Captação de Talentos', icon: '※' },
  { id: 'times', label: 'Times & Convites', icon: '▞' },
  { id: 'vendas', label: 'Vendas & Checkout', icon: '▟' },
  { id: 'marketing', label: 'Marketing & Conversão', icon: '✜' },
  { id: 'boxes', label: '🎁 Sistema BØX', icon: '🎁' }
] as const

const ADMIN_ROLES: UserRole[] = ['admin', 'marketing', 'dev']

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function DevDashboard() {
  console.log('🚀 DevDashboard sendo inicializado')
  
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTeams: 0,
    totalAudiovisual: 0,
    totalAtletas: 0,
    totalParceiros: 0,
    totalPatrocinadores: 0,
    faturamentoTotal: 0,
    receitaPorLote: {},
    receitaPorCategoria: {},
    receitaPorGateway: {},
    ticketMedioPorTime: 0,
    upsellsVendidos: {},
  })
  
  const [gamificationStats, setGamificationStats] = useState<GamificationStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPoints: 0,
    averagePoints: 0,
    topUsers: [],
    achievementsUnlocked: 0,
    rewardsRedeemed: 0,
    engagementRate: 0
  })
  
  const [marketingStats, setMarketingStats] = useState<MarketingStats>({
    conversionRate: 0,
    userEngagement: 0,
    topUserTypes: [],
    campaignPerformance: {},
    salesMetrics: {
      totalRevenue: 0,
      averageTicket: 0,
      conversionFunnel: {}
    }
  })
  
  const [users, setUsers] = useState<FirestoreUser[]>([])
  const [teams, setTeams] = useState<FirestoreTeam[]>([])
  const [patrocinadores, setPatrocinadores] = useState<FirestorePatrocinador[]>([])
  const [teamInvites, setTeamInvites] = useState<FirestoreTeamInvite[]>([])
  
  // Estados para sistema de BØX
  const [loadingBoxes, setLoadingBoxes] = useState(false)
  const [allUsersBoxes, setAllUsersBoxes] = useState<Record<string, UserBox[]>>({})

  const { trackAdmin } = useAnalytics()

  // ============================================================================
  // FUNÇÕES DE CARREGAMENTO DE DADOS
  // ============================================================================

  const fetchCollection = useCallback(async (collectionName: string): Promise<FirestoreDocument[]> => {
    try {
      const snapshot = await getDocs(collection(db, collectionName))
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error(`❌ Erro ao carregar ${collectionName}:`, error)
      return []
    }
  }, [])

  const handlePhotoUpload = async (file: File) => {
    if (!userData?.uid) return
    
    setIsUploadingPhoto(true)
    try {
      const photoRef = ref(storage, `profile-photos/${userData.uid}`)
      await uploadBytes(photoRef, file)
      const downloadURL = await getDownloadURL(photoRef)
      
      const userRef = doc(db, 'users', userData.uid)
      await updateDoc(userRef, { profilePhoto: downloadURL })
      
      setProfilePhoto(downloadURL)
      alert('✅ Foto de perfil atualizada com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao fazer upload da foto:', error)
      alert('❌ Erro ao fazer upload da foto')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handlePhotoUpload(file)
    }
  }

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click()
  }





  const calculateGamificationStats = useCallback(async (): Promise<GamificationStats> => {
    try {
      // Buscar dados das coleções de gamificação
      const [gamificationActions, gamificationLeaderboard, gamificationAchievements] = await Promise.all([
        fetchCollection('gamification_actions'),
        fetchCollection('gamification_leaderboard'), 
        fetchCollection('gamification_achievements')
      ])

      const totalPoints = gamificationActions.reduce((total, action) => total + ((action.points as number) || 0), 0)
      const totalUsers = gamificationLeaderboard.length
      const activeUsers = gamificationLeaderboard.filter(user => {
        const lastActionAt = user.lastActionAt as { toDate?: () => Date }
        return lastActionAt?.toDate && new Date(lastActionAt.toDate()) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }).length
      const averagePoints = totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0

      // Top 10 usuários do leaderboard
      const topUsers = gamificationLeaderboard
        .slice(0, 10)
        .map((user) => ({
          userId: (user.userId as string) || '',
          userName: (user.userName as string) || 'Usuário',
          points: (user.points as number) || 0,
          level: (user.level as string) || 'Bronze'
        }))

      const achievementsUnlocked = gamificationAchievements.length
      const rewardsRedeemed = gamificationActions.filter(action => (action.action as string) === 'reward_redeemed').length
      const engagementRate = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0

      return {
        totalUsers,
        activeUsers,
        totalPoints,
        averagePoints,
        topUsers,
        achievementsUnlocked,
        rewardsRedeemed,
        engagementRate
      }
    } catch (error) {
      console.error('Erro ao calcular estatísticas de gamificação:', error)
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalPoints: 0,
        averagePoints: 0,
        topUsers: [],
        achievementsUnlocked: 0,
        rewardsRedeemed: 0,
        engagementRate: 0
      }
    }
  }, [fetchCollection])

  const calculateMarketingStats = useCallback((usersData: FirestoreDocument[], teamsData: FirestoreDocument[]): MarketingStats => {
    const totalUsers = usersData.length
    const convertedUsers = teamsData.length
    const conversionRate = totalUsers > 0 ? Math.round((convertedUsers / totalUsers) * 100) : 0
    
    const totalRevenue = teamsData.reduce((total, team) => total + ((team.valor as number) || 0), 0)
    const averageTicket = teamsData.length > 0 ? Math.round(totalRevenue / teamsData.length) : 0

    // Calcular distribuição por tipos de usuário
    const userTypeDistribution = usersData.reduce((acc, user) => {
      const role = (user.role as string) || 'publico'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topUserTypes = Object.keys(userTypeDistribution)
      .sort((a, b) => userTypeDistribution[b] - userTypeDistribution[a])
      .slice(0, 4)

    // Performance de campanhas (dados simulados baseados em dados reais)
    const campaignPerformance = {
      'email': Math.floor(conversionRate * 1.2),
      'social': Math.floor(conversionRate * 0.8), 
      'referral': Math.floor(conversionRate * 1.5),
      'direct': Math.floor(conversionRate * 0.9)
    }

    return {
      conversionRate,
      userEngagement: Math.min(Math.floor(conversionRate * 1.5), 100),
      topUserTypes,
      campaignPerformance,
      salesMetrics: {
        totalRevenue,
        averageTicket,
        conversionFunnel: {
          'awareness': totalUsers,
          'consideration': Math.floor(totalUsers * 0.7),
          'conversion': convertedUsers
        }
      }
    }
  }, [])

  const loadStats = useCallback(async () => {
    try {
      const [
        usersData, 
        teamsData, 
        audiovisualData, 
        patrocinadoresData,
        teamInvitesData,
        inscricoesImportadasData
      ] = await Promise.all([
        fetchCollection('users'),
        fetchCollection('teams'),
        fetchCollection('audiovisual'),
        fetchCollection('patrocinadores'),
        fetchCollection('team_invites'),
        fetchCollection('inscricoes_importadas'),
        fetchCollection('gamification_actions')
      ])

      // Mapear informações de times para usuários usando a estrutura correta
      const teamMap = new Map<string, { teamName: string; isCaptain: boolean; teamId: string; slot: number }>()
      
      teamsData.forEach((team: FirestoreDocument) => {
        const teamData = team as FirestoreTeam
        
        // LÓGICA PARA IDENTIFICAR CAPITÕES:
        // 1. Usuários importados via migração são considerados capitões
        // 2. Verificar campo captainId se existir
        // 3. Verificar role nos membros
        
        if (teamData.members && Array.isArray(teamData.members)) {
          teamData.members.forEach((member) => {
            if (member.email) {
                             // Verificar se é capitão por role ou se foi importado
               const userDoc = usersData.find(u => u.email === member.email)
               const isCaptain = Boolean(
                 member.role === 'captain' || 
                 (member.role === 'atleta' && userDoc && 'migration_source' in userDoc)
               )
              
              teamMap.set(member.email, {
                teamName: (teamData.nome || teamData.name || 'Time sem nome'),
                isCaptain: isCaptain,
                teamId: teamData.id,
                slot: member.slot
              })
            }
          })
        }
        
        // Verificar se o usuário é capitão pelo captainId
        if (teamData.captainId) {
          const captainUser = usersData.find(user => user.id === teamData.captainId)
          if (captainUser && captainUser.email && typeof captainUser.email === 'string') {
            teamMap.set(captainUser.email, {
              teamName: (teamData.nome || teamData.name || 'Time sem nome'),
              isCaptain: true,
              teamId: teamData.id,
              slot: 0 // Capitão não tem slot específico
            })
          }
        }
        
        // IDENTIFICAÇÃO AUTOMÁTICA DE CAPITÕES PARA DADOS MIGRADOS:
        // Se não há captainId definido, considerar o primeiro membro como capitão
        if (!teamData.captainId && teamData.members && teamData.members.length > 0) {
          const firstMember = teamData.members[0]
          if (firstMember.email) {
            const existingInfo = teamMap.get(firstMember.email)
            if (existingInfo) {
              // Atualizar para marcar como capitão
              teamMap.set(firstMember.email, {
                ...existingInfo,
                isCaptain: true
              })
            } else {
              // Criar nova entrada como capitão
              teamMap.set(firstMember.email, {
                teamName: (teamData.nome || teamData.name || 'Time sem nome'),
                isCaptain: true,
                teamId: teamData.id,
                slot: firstMember.slot
              })
            }
          }
        }
      })

      // Adicionar informações de time aos usuários
      const usersWithTeamInfo = usersData.map((user: FirestoreDocument) => ({
        ...user,
        teamInfo: teamMap.get(user.email as string)
      }))

      const atletasCount = usersData.filter(user => user.role === 'atleta').length
      const parceirosCount = patrocinadoresData.filter(pat => pat.status === 'ativo' || pat.status === 'complete').length

      // ✅ CORRIGIDO: Usar resumo_inscricoes para faturamento (mais eficiente)
      let faturamentoTotal = 0
      try {
        const resumoDoc = await getDoc(doc(db, 'resumo_inscricoes', 'interbox_2025'))
        if (resumoDoc.exists()) {
          const resumoData = resumoDoc.data()
          faturamentoTotal = (resumoData?.metricas_financeiras?.receita_total as number) || 0
          console.log('💰 Faturamento carregado do resumo:', faturamentoTotal)
        } else {
          console.log('⚠️ Documento de resumo não encontrado, calculando das inscrições...')
          // Fallback para inscricoes_importadas
          faturamentoTotal = inscricoesImportadasData.reduce((total, inscricao) => {
            const valor = (inscricao.valor as number) || (inscricao.amount as number) || 0
            return total + (typeof valor === 'number' ? valor : 0)
          }, 0)
        }
      } catch (error) {
        console.error('❌ Erro ao carregar resumo de faturamento:', error)
        // Fallback para inscricoes_importadas
        faturamentoTotal = inscricoesImportadasData.reduce((total, inscricao) => {
          const valor = (inscricao.valor as number) || (inscricao.amount as number) || 0
          return total + (typeof valor === 'number' ? valor : 0)
        }, 0)
      }
      
      // ✅ CORRIGIDO: Calcular receita por lote das inscrições
      const receitaPorLote = inscricoesImportadasData.reduce((acc, inscricao) => {
        const lote = (inscricao.lote as string) || (inscricao.batch as string) || 'default'
        const valor = (inscricao.valor as number) || (inscricao.amount as number) || 0
        acc[lote] = (acc[lote] || 0) + (typeof valor === 'number' ? valor : 0)
        return acc
      }, {} as Record<string, number>)
      
      // ✅ CORRIGIDO: Calcular receita por categoria das inscrições
      const receitaPorCategoria = inscricoesImportadasData.reduce((acc, inscricao) => {
        const categoria = (inscricao.categoria as string) || 'default'
        const valor = (inscricao.valor as number) || (inscricao.amount as number) || 0
        acc[categoria] = (acc[categoria] || 0) + (typeof valor === 'number' ? valor : 0)
        return acc
      }, {} as Record<string, number>)
      
      // ✅ CORRIGIDO: Calcular receita por gateway das inscrições
      const receitaPorGateway = inscricoesImportadasData.reduce((acc, inscricao) => {
        const gateway = (inscricao.gateway as string) || (inscricao.paymentMethod as string) || 'default'
        const valor = (inscricao.valor as number) || (inscricao.amount as number) || 0
        acc[gateway] = (acc[gateway] || 0) + (typeof valor === 'number' ? valor : 0)
        return acc
      }, {} as Record<string, number>)
      
      const ticketMedioPorTime = inscricoesImportadasData.length > 0 ? faturamentoTotal / inscricoesImportadasData.length : 0

      setStats({
        totalUsers: usersData.length,
        totalTeams: teamsData.length,
        totalAudiovisual: audiovisualData.length,
        totalAtletas: atletasCount,
        totalParceiros: parceirosCount,
        totalPatrocinadores: patrocinadoresData.length,
        faturamentoTotal,
        receitaPorLote,
        receitaPorCategoria,
        receitaPorGateway,
        ticketMedioPorTime,
        upsellsVendidos: {}
      })

      setUsers(usersWithTeamInfo as FirestoreUser[])
      setTeams(teamsData as FirestoreTeam[])
      setPatrocinadores(patrocinadoresData as FirestorePatrocinador[])
      setTeamInvites(teamInvitesData.map(invite => ({
        id: invite.id,
        teamId: (invite.teamId as string) || '',
        teamName: (invite.teamName as string) || '',
        captainId: (invite.captainId as string) || '',
        invitedEmail: (invite.invitedEmail as string) || '',
        status: (invite.status as 'pending' | 'accepted' | 'rejected' | 'expired') || 'pending',
        createdAt: invite.createdAt as Date || new Date(),
        expiresAt: invite.expiresAt as Date,
        slot: (invite.slot as number) || 1,
        code: (invite.code as string) || ''
      })))
      
      // Log para verificar dados de convites
      console.log('📧 Team invites encontrados:', teamInvitesData.length)
      if (teamInvitesData.length > 0) {
        console.log('📧 Exemplo de convite:', teamInvitesData[0])
      }

      // ✅ Carregar estatísticas de gamificação e marketing
      try {
        const gamificationData = await calculateGamificationStats()
        setGamificationStats(gamificationData)
        
        const marketingData = calculateMarketingStats(usersData, teamsData)
        setMarketingStats(marketingData)
      } catch (error) {
        console.error('❌ Erro ao carregar estatísticas de gamificação/marketing:', error)
      }

    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error)
    }
  }, [fetchCollection, calculateGamificationStats, calculateMarketingStats])

  const loadUserData = useCallback(async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        const userData = { uid, ...userDoc.data() } as UserData
        console.log('👤 Dados do usuário carregados:', userData)
        console.log('📸 URL da foto de perfil:', userData.profilePhoto)
        setUserData(userData)
        
        // Verificar tanto profilePhoto quanto photoURL para compatibilidade
        const photoUrl = userData.profilePhoto || userData.photoURL
        if (photoUrl) {
          console.log('✅ Definindo foto de perfil:', photoUrl)
          setProfilePhoto(photoUrl)
        } else {
          console.log('❌ Nenhuma foto de perfil encontrada no documento do usuário')
          console.log('🔍 Campos verificados - profilePhoto:', userData.profilePhoto, 'photoURL:', userData.photoURL)
        }
        
        if (!ADMIN_ROLES.includes(userData.role)) {
          console.error('❌ Usuário não tem permissão de admin. Role:', userData.role)
          window.location.href = '/'
          return
        }
        
        // ✅ Parar loading após carregar dados do usuário
        setLoading(false)
      } else {
        console.error('❌ Usuário não encontrado no Firestore')
        setLoading(false) // ✅ Parar loading em caso de erro
        window.location.href = '/'
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error)
      setLoading(false) // ✅ Parar loading em caso de erro
      window.location.href = '/'
    }
  }, [])

  // Função loadApoiadores removida - não mais utilizada

  // Carregar BØX de todos os usuários
  const loadAllUsersBoxes = useCallback(async () => {
    try {
      setLoadingBoxes(true)
      
      // 🔥 INTEGRAÇÃO COM SISTEMA VALIDADO: Buscar dados de gamificação de todos os usuários
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const allUsersBoxes: Record<string, UserBox[]> = {}
      
      for (const userDoc of usersSnapshot.docs) {
        const user = userDoc.data()
        const uid = userDoc.id
        
        if (!user.gamification) continue
        
        const achievements = user.gamification.achievements || []
        const tokens = user.gamification.tokens?.box?.balance || 0
        const level = user.gamification.level || 'cindy'
        const totalActions = user.gamification.totalActions || 0
        const challenges = user.gamification.challenges || []
        const referralTokens = user.gamification.referralTokens || 0
        const streakDays = user.gamification.streakDays || 0
        const rewards = user.gamification.rewards || []
        
        // 🔥 CONVERTER DADOS REAIS EM BØX VISUAIS (SISTEMA VALIDADO)
        const boxes: UserBox[] = []
        
        // 🏆 BØX por nível atual do usuário (sistema validado)
        if (level === 'matt') {
          boxes.push({
            id: 'nivel_matt',
            userId: uid,
            nivel: 'matt',
            evento: '👑 Nível Matt',
            data: new Date(),
            descricao: '👑 O Escolhido - 2000+ $BOX conquistados! Ranking TOP da competição',
            pontuacao: tokens,
            categoria: 'Ranking',
            status: 'ativo'
          })
        } else if (level === 'murph') {
          boxes.push({
            id: 'nivel_murph',
            userId: uid,
            nivel: 'murph',
            evento: '🛡️ Nível Murph',
            data: new Date(),
            descricao: '🛡️ A Prova Final - 1000-1999 $BOX! Top 10% da competição',
            pontuacao: tokens,
            categoria: 'Ranking',
            status: 'ativo'
          })
        } else if (level === 'annie') {
          boxes.push({
            id: 'nivel_annie',
            userId: uid,
            nivel: 'annie',
            evento: '⛓️ Nível Annie',
            data: new Date(),
            descricao: '⛓️ A Coordenação - 600-999 $BOX! Top 25% da competição',
            pontuacao: tokens,
            categoria: 'Ranking',
            status: 'ativo'
          })
        } else if (level === 'fran') {
          boxes.push({
            id: 'nivel_fran',
            userId: uid,
            nivel: 'fran',
            evento: '💣 Nível Fran',
            data: new Date(),
            descricao: '💣 O Inferno Curto - 300-599 $BOX! Top 50% da competição',
            pontuacao: tokens,
            categoria: 'Ranking',
            status: 'ativo'
          })
        } else if (level === 'helen') {
          boxes.push({
            id: 'nivel_helen',
            userId: uid,
            nivel: 'helen',
            evento: '🌀 Nível Helen',
            data: new Date(),
            descricao: '🌀 O Fôlego - 100-299 $BOX! Top 75% da competição',
            pontuacao: tokens,
            categoria: 'Ranking',
            status: 'ativo'
          })
        } else {
          boxes.push({
            id: 'nivel_cindy',
            userId: uid,
            nivel: 'cindy',
            evento: '👣 Nível Cindy',
            data: new Date(),
            descricao: '👣 A Base - 0-99 $BOX! Começando a jornada na competição',
            pontuacao: tokens,
            categoria: 'Ranking',
            status: 'ativo'
          })
        }
        
        // 🎉 BØX por achievements específicos (sistema validado)
        if (achievements.includes('primeiro_pagamento')) {
          boxes.push({
            id: 'primeiro_pagamento',
            userId: uid,
            nivel: level,
            evento: '🏆 Primeiro Pagamento',
            data: new Date(),
            descricao: 'BÔNUS INAUGURAL - Primeira compra realizada (+100 $BOX)',
            pontuacao: 100,
            categoria: 'Pagamento',
            status: 'ativo'
          })
        }
        
        if (achievements.includes('perfil_completo')) {
          boxes.push({
            id: 'perfil_completo',
            userId: uid,
            nivel: level,
            evento: '🏅 Perfil Completo',
            data: new Date(),
            descricao: 'BÔNUS INAUGURAL - Perfil 100% preenchido (+25 $BOX)',
            pontuacao: 25,
            categoria: 'Perfil',
            status: 'ativo'
          })
        }
        
        // 🎯 BØX por cadastro (sistema validado)
        if (totalActions >= 1) {
          boxes.push({
            id: 'cadastro_inicial',
            userId: uid,
            nivel: level,
            evento: '🚀 Cadastro Inicial',
            data: new Date(),
            descricao: 'BØX por se cadastrar no sistema (+10 $BOX)',
            pontuacao: 10,
            categoria: 'Sistema',
            status: 'ativo'
          })
        }
        
        // 🏆 BØX por desafios (sistema validado)
        challenges.forEach((challenge: { name?: string; description?: string; points?: number }, index: number) => {
          boxes.push({
            id: `challenge_${index}`,
            userId: uid,
            nivel: level,
            evento: `🏆 Desafio: ${challenge.name || `#${index + 1}`}`,
            data: new Date(),
            descricao: `Desafio completado: ${challenge.description || 'Desafio da competição'}`,
            pontuacao: challenge.points || 50,
            categoria: 'Desafio',
            status: 'ativo'
          })
        })
        
        // 👥 BØX por referral (sistema validado)
        if (referralTokens > 0) {
          boxes.push({
            id: 'referral_tokens',
            userId: uid,
            nivel: level,
            evento: '👥 Sistema de Referral',
            data: new Date(),
            descricao: `BØX por convidar amigos: ${referralTokens} tokens ganhos`,
            pontuacao: referralTokens,
            categoria: 'Referral',
            status: 'ativo'
          })
        }
        
        // 🔥 BØX por streak (sistema validado)
        if (streakDays > 0) {
          boxes.push({
            id: 'streak_days',
            userId: uid,
            nivel: level,
            evento: '🔥 Sequência de Login',
            data: new Date(),
            descricao: `Sequência de ${streakDays} dias consecutivos de login`,
            pontuacao: streakDays * 5,
            categoria: 'Streak',
            status: 'ativo'
          })
        }
        
        // 🏅 BØX por recompensas (sistema validado)
        rewards.forEach((reward: { name?: string; description?: string; points?: number }, index: number) => {
          boxes.push({
            id: `reward_${index}`,
            userId: uid,
            nivel: level,
            evento: `🏅 Recompensa: ${reward.name || `#${index + 1}`}`,
            data: new Date(),
            descricao: `Recompensa desbloqueada: ${reward.description || 'Recompensa da competição'}`,
            pontuacao: reward.points || 25,
            categoria: 'Recompensa',
            status: 'ativo'
          })
        })
        
        // 🎯 BØX por total de ações (sistema validado)
        if (totalActions > 0) {
          boxes.push({
            id: 'total_acoes',
            userId: uid,
            nivel: level,
            evento: '🎯 Total de Ações',
            data: new Date(),
            descricao: `${totalActions} ações realizadas na plataforma`,
            pontuacao: totalActions,
            categoria: 'Ações',
            status: 'ativo'
          })
        }
        
        // 🎭 BØX por tipo de usuário
        if (user.role === 'dev') {
          boxes.push({
            id: 'role_dev',
            userId: uid,
            nivel: level,
            evento: '⚡ Dev da Competição',
            data: new Date(),
            descricao: 'BØX por ser desenvolvedor ativo no sistema (+50 $BOX)',
            pontuacao: 50,
            categoria: 'Role',
            status: 'ativo'
          })
        }
        
        if (user.role === 'admin') {
          boxes.push({
            id: 'role_admin',
            userId: uid,
            nivel: level,
            evento: '👑 Admin da Competição',
            data: new Date(),
            descricao: 'BØX por ser administrador ativo no sistema (+100 $BOX)',
            pontuacao: 100,
            categoria: 'Role',
            status: 'ativo'
          })
        }
        
        allUsersBoxes[uid] = boxes
      }
      
      setAllUsersBoxes(allUsersBoxes)
      
    } catch (error) {
      console.error('Erro ao carregar BØX de todos os usuários:', error)
      setAllUsersBoxes({})
    } finally {
      setLoadingBoxes(false)
    }
  }, [])

  useEffect(() => {
    const initializeAuth = async () => {
      const auth = await getAuth()
      const { onAuthStateChanged } = await import('firebase/auth');
      
      const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadUserData(user.uid)
      } else {
        setLoading(false) // ✅ Parar loading se não há usuário
        window.location.href = '/login'
      }
      })

      return unsubscribe;
    };

    initializeAuth().then(unsubscribe => {
      if (unsubscribe) {
        return () => unsubscribe();
      }
    });
  }, [loadUserData])

  useEffect(() => {
    if (userData && !loading) {
      loadStats()
      loadAllUsersBoxes() // Carregar BØX de todos os usuários
    }
  }, [userData, loading, loadStats, loadAllUsersBoxes])

  const handleLogout = async () => {
    trackAdmin()
    const auth = await getAuth();
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userData || !ADMIN_ROLES.includes(userData.role)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-300">Você não tem permissão para acessar este dashboard.</p>
          <a href="/" className="text-pink-400 hover:text-pink-300 mt-4 inline-block">
            Voltar para Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen dashboard-ios">
      <Header />
      
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .tab-container {
          scroll-behavior: smooth;
        }
      `}</style>
      
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="ios-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border-4 border-purple-500">
                    {profilePhoto ? (
                      <img 
                        src={profilePhoto} 
                        alt="Foto de Perfil" 
                        className="w-full h-full object-cover"
                        onLoad={() => console.log('✅ Foto carregada com sucesso:', profilePhoto)}
                        onError={(e) => console.error('❌ Erro ao carregar foto:', e, 'URL:', profilePhoto)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">
                        👤
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={triggerPhotoUpload}
                    disabled={isUploadingPhoto}
                    className="absolute -bottom-1 -right-1 bg-purple-600 hover:bg-purple-700 text-white p-1 rounded-full transition-colors duration-200 disabled:opacity-50"
                    title="Alterar foto de perfil"
                  >
                    {isUploadingPhoto ? '🔄' : '📸'}
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-6">
                <div>
                      <h1 className="text-2xl font-bold text-gray-900">⧑ Dashboard Dev</h1>
                      <p className="text-gray-600">Bem-vindo, {userData.displayName}</p>
                </div>
                    
                    {/* Informações de Perfil */}
                    <div className="hidden lg:flex items-center gap-6 ml-8">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-500">Email</div>
                        <div className="text-sm text-gray-900">{userData.email}</div>
              </div>
              
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-500">Função</div>
                        <div className="text-sm font-bold text-purple-600">{userData.role.toUpperCase()}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-500">Status</div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Ativo
                </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLogout}
                  className="ios-btn"
                  style={{ background: 'var(--ios-error)' }}
                >
                  Sair
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="overflow-x-auto scrollbar-hide tab-container" aria-label="Tabs">
                <div className="flex space-x-1 px-6 min-w-max">
                {DEV_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-3 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                          ? 'border-pink-500 text-pink-600 bg-pink-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                      title={tab.label}
                  >
                    <span className="mr-2">{tab.icon}</span>
                      <span className="hidden lg:inline">{tab.label}</span>
                      <span className="hidden md:inline lg:hidden">{tab.label.split(' ')[0]}</span>
                      <span className="md:hidden">{tab.icon}</span>
                  </button>
                ))}
                </div>
              </nav>
            </div>
          </div>

          <TabContent 
            activeTab={activeTab} 
            stats={stats} 
            users={users} 
            teams={teams} 
            patrocinadores={patrocinadores}
            teamInvites={teamInvites}
            gamificationStats={gamificationStats}
            marketingStats={marketingStats}
            allUsersBoxes={allUsersBoxes}
            loadingBoxes={loadingBoxes}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

interface TabContentProps {
  activeTab: string
  stats: Stats
  users: FirestoreUser[]
  teams: FirestoreTeam[]
  patrocinadores: FirestorePatrocinador[]
  teamInvites: FirestoreTeamInvite[]
  gamificationStats: GamificationStats
  marketingStats: MarketingStats
  allUsersBoxes: Record<string, UserBox[]>
  loadingBoxes: boolean
}

function TabContent({ activeTab, stats, users, teams, patrocinadores, teamInvites, gamificationStats, marketingStats, allUsersBoxes, loadingBoxes }: TabContentProps) {
  switch (activeTab) {
          case 'overview':
        return <OverviewTab stats={stats} gamificationStats={gamificationStats} marketingStats={marketingStats} users={users} />
    case 'usuarios':
      return <UsuariosTab users={users} />
    case 'patrocinadores':
      try {
        console.log('🏢 Renderizando PatrocinadoresDashboard')
        return <PatrocinadoresDashboard />
      } catch (error) {
        console.error('❌ Erro ao renderizar PatrocinadoresDashboard:', error)
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🏢 Gestão de Patrocinadores</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">Erro ao carregar o dashboard de patrocinadores.</p>
              <p className="text-red-600 text-sm mt-2">Verifique o console para mais detalhes.</p>
            </div>
          </div>
        )
      }
    case 'analises':
      return <AnalisesTab />
    case 'monitoramento':
      return <MonitoramentoTab />
    case 'cotas':
      return <CotasTab />

    case 'charts':
      return <DashboardCharts users={users} teams={teams} parceiros={patrocinadores} />
    case 'operacao':
      return <OperacaoTab />
    case 'comunidade':
      return <ComunidadeTab />
    case 'talentos':
      return <TalentosTab />
    case 'times':
      return <TimesTab teams={teams} users={users} teamInvites={teamInvites} />
    case 'vendas':
      return <VendasTab />
    case 'marketing':
      return <MarketingTab marketingStats={marketingStats} />
    case 'boxes':
      return <BoxesTab allUsersBoxes={allUsersBoxes} users={users} loadingBoxes={loadingBoxes} />
    default:
      return <OverviewTab stats={stats} gamificationStats={gamificationStats} marketingStats={marketingStats} users={users} />
  }
}

// ============================================================================
// COMPONENTES DAS TABS
// ============================================================================

// Usuários Tab - Com informações de time e capitão
function UsuariosTab({ users }: { users: FirestoreUser[] }) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">👥</div>
        <p className="text-gray-600">Nenhum usuário encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 Gestão de Usuários</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Usuários</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time/Capitão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-purple-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-700">
                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.displayName || 'Sem nome'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email || 'Sem email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user.status || 'Ativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'atleta' && user.teamInfo ? (
                      <div className="text-center">
                        <div className="text-sm font-medium text-blue-600">
                          {user.teamInfo.teamName}
                        </div>
                        {user.teamInfo.isCaptain && (
                          <div className="text-xs text-yellow-600 font-bold">
                            👑 Capitão
                          </div>
                        )}
                      </div>
                    ) : user.role === 'atleta' ? (
                      <span className="text-xs text-gray-500">Sem time</span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Outras tabs básicas
function OverviewTab({ stats, gamificationStats, marketingStats, users }: { stats: Stats; gamificationStats: GamificationStats; marketingStats: MarketingStats; users: FirestoreUser[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Visão Geral - Dev Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Times</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTeams}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Faturamento Total</p>
              <p className="text-2xl font-bold text-gray-900">R$ {stats.faturamentoTotal.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <img 
                src="/logos/BOX.png" 
                alt="BOX Token" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total $BOX Distribuídos</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.reduce((total: number, user: FirestoreUser) => {
                  const boxTokens = user.gamification?.tokens?.box?.balance || 
                                   user.gamification?.tokens?.box?.totalEarned || 0
                  return total + boxTokens
                }, 0).toLocaleString()} $BOX
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* ✅ Novas seções com estatísticas de gamificação e marketing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎮 Gamificação</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Usuários Ativos:</span> {gamificationStats.activeUsers}</p>
            <p><span className="font-medium">Pontos Médios:</span> {gamificationStats.averagePoints}</p>
            <p><span className="font-medium">Conquistas:</span> {gamificationStats.achievementsUnlocked}</p>
            <p><span className="font-medium">Engajamento:</span> {gamificationStats.engagementRate}%</p>
          </div>
          </div>
          
        <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
          <h3 className="text-lg font-semibold text-gray-500 mb-4">📈 Marketing (Em Produção)</h3>
          <div className="space-y-2 text-gray-400">
            <p><span className="font-medium">Taxa Conversão:</span> {marketingStats.conversionRate}%</p>
            <p><span className="font-medium">Engajamento:</span> {marketingStats.userEngagement}%</p>
            <p><span className="font-medium">Ticket Médio:</span> R$ {marketingStats.salesMetrics.averageTicket.toLocaleString()}</p>
            <p><span className="font-medium">Receita Total:</span> R$ {marketingStats.salesMetrics.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="mt-4 p-3 bg-gray-200 rounded text-center">
            <p className="text-sm text-gray-600">⏳ Aguardando definição da equipe de Marketing</p>
          </div>
        </div>
      </div>
    </div>
  )
}



// Tabs básicas restantes
function AnalisesTab() {
  return <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800 mb-6">🔍 Análises Técnicas</h2></div>
}

function MonitoramentoTab() {
  return <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800 mb-6">⚙️ Monitoramento do Sistema</h2></div>
}

function CotasTab() {
  return <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800 mb-6">💰 Gestão de Cotas e Promessas</h2></div>
}

function OperacaoTab() {
  return <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800 mb-6">🏥 Saúde/Operação</h2></div>
}

function ComunidadeTab() {
  return <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800 mb-6">🌟 Comunidade</h2></div>
}

function TalentosTab() {
  return <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800 mb-6">🎯 Captação de Talentos</h2></div>
}

function TimesTab({ teams, users, teamInvites }: { teams: FirestoreTeam[]; users: FirestoreUser[]; teamInvites: FirestoreTeamInvite[] }) {
  const [selectedTeam, setSelectedTeam] = useState<FirestoreTeam | null>(null)
  const [showTeamDetails, setShowTeamDetails] = useState(false)

  if (teams.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 Times & Convites</h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-gray-600">Nenhum time encontrado</p>
        </div>
      </div>
    )
  }

  // Calcular estatísticas dos times
  const totalTeams = teams.length
  const activeTeams = teams.filter(team => team.status === 'complete' || team.status === 'confirmado' || !team.status).length
  const teamsByCategory = teams.reduce((acc, team) => {
    const category = team.categoria || 'Sem categoria'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Encontrar usuários que são capitães
  const captains = users.filter(user => 
    user.teamInfo?.isCaptain && user.role === 'atleta'
  )

  // Calcular estatísticas de convites
  const pendingInvites = teamInvites.filter(invite => invite.status === 'pending')
  const acceptedInvites = teamInvites.filter(invite => invite.status === 'accepted')
  const expiredInvites = teamInvites.filter(invite => invite.status === 'expired')
  
  console.log('📧 Convites por status:', {
    total: teamInvites.length,
    pending: pendingInvites.length,
    accepted: acceptedInvites.length,
    expired: expiredInvites.length
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 Times & Convites</h2>
      
      {/* Estatísticas dos Times */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Times</p>
              <p className="text-2xl font-bold text-gray-900">{totalTeams}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Times Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{activeTeams}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">👑</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Capitães</p>
              <p className="text-2xl font-bold text-gray-900">{captains.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categorias</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(teamsByCategory).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas de Convites */}
      {teamInvites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">📧</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Convites Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{pendingInvites.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Convites Aceitos</p>
                <p className="text-2xl font-bold text-gray-900">{acceptedInvites.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Convites Expirados</p>
                <p className="text-2xl font-bold text-gray-900">{expiredInvites.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Convites</p>
                <p className="text-2xl font-bold text-gray-900">{teamInvites.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distribuição por Categoria */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">📊 Distribuição por Categoria</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(teamsByCategory).map(([category, count]) => (
              <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-gray-600">{category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Times */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">👥 Lista de Times</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Academia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teams.map((team) => (
                <tr key={team.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">
                            {(team.nome || team.name || 'T').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {team.nome || team.name || 'Time sem nome'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {team.members ? `${team.members.filter(m => m.status === 'active').length} ativos` : '0 membros'}
                          {team.openSlots !== undefined && team.openSlots > 0 && (
                            <span className="ml-2 text-xs text-blue-600">
                              ({team.openSlots} vagas)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {team.categoria || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {team.box?.nome || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {team.box?.cidade || ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      (team.status === 'complete' || team.status === 'confirmado' || !team.status) 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {team.status || 'Ativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => {
                        setSelectedTeam(team)
                        setShowTeamDetails(true)
                      }}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Ver Detalhes
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista de Convites Pendentes */}
      {pendingInvites.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">📧 Convites Pendentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Convidado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expira em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingInvites.map((invite) => (
                  <tr key={invite.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invite.teamName || teams.find(t => t.id === invite.teamId)?.nome || 'Time não encontrado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invite.invitedEmail || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Slot {invite.slot || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invite.createdAt ? new Date(invite.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        ⏳ Pendente
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Time */}
      {showTeamDetails && selectedTeam && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  🏆 {selectedTeam.nome || selectedTeam.name || 'Detalhes do Time'}
                </h3>
                <button
                  onClick={() => setShowTeamDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categoria</label>
                    <p className="text-gray-900">{selectedTeam.categoria || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="text-gray-900">{selectedTeam.status || 'Ativo'}</p>
                  </div>
                </div>
                
                {selectedTeam.box && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Academia</label>
                    <p className="text-gray-900">{selectedTeam.box.nome} - {selectedTeam.box.cidade}</p>
                  </div>
                )}
                
                {selectedTeam.members && Array.isArray(selectedTeam.members) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Membros ({selectedTeam.members.length})</label>
                    <div className="space-y-2">
                      {selectedTeam.members.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">
                              Slot {member.slot}
                            </span>
                            <span className="text-sm text-gray-600">
                              {member.email || `Membro ${index + 1}`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              member.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : member.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {member.status === 'active' ? '✅ Ativo' : 
                               member.status === 'pending' ? '⏳ Pendente' : '❌ Inativo'}
                            </span>
                            {member.role === 'captain' && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                👑 Capitão
                              </span>
                            )}
                            {member.role === 'atleta' && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                🏃 Atleta
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedTeam.competition?.resultados && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resultados de Competição</label>
                    <div className="space-y-1">
                                             {selectedTeam.competition.resultados.map((resultado: { pontuacao: number }, index: number) => (
                        <p key={index} className="text-sm text-gray-900">
                          Evento {index + 1}: {resultado.pontuacao} pontos
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowTeamDetails(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function VendasTab() {
  return <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800 mb-6">💳 Vendas & Checkout</h2></div>
}

function MarketingTab({ marketingStats }: { marketingStats: MarketingStats }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 Marketing & Conversão</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Métricas de Conversão</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Taxa de Conversão:</span>
              <span className="font-bold text-green-600">{marketingStats.conversionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Engajamento de Usuários:</span>
              <span className="font-bold text-blue-600">{marketingStats.userEngagement}%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Métricas de Vendas</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Receita Total:</span>
              <span className="font-bold text-green-600">R$ {marketingStats.salesMetrics.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ticket Médio:</span>
              <span className="font-bold text-blue-600">R$ {marketingStats.salesMetrics.averageTicket.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Performance de Campanhas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(marketingStats.campaignPerformance).map(([campaign, performance]) => (
            <div key={campaign} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{performance}%</div>
              <div className="text-sm text-gray-600 capitalize">{campaign}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BoxesTab({ allUsersBoxes, users, loadingBoxes }: { allUsersBoxes: Record<string, UserBox[]>; users: FirestoreUser[]; loadingBoxes: boolean }) {
  if (loadingBoxes) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-600 mt-4">Carregando BØX...</p>
      </div>
    )
  }

  if (Object.keys(allUsersBoxes).length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🎁</div>
        <p className="text-gray-600">Nenhum BØX encontrado.</p>
      </div>
    )
  }

  // Mostrar BØX de todos os usuários para análise dev
  const allBoxes = Object.entries(allUsersBoxes).flatMap(([userId, boxes]) => 
    boxes.map(box => ({ ...box, userId }))
  )

  if (allBoxes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🎁</div>
        <p className="text-gray-600">Nenhum BØX encontrado no sistema.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🎁 Sistema BØX - Análise Dev</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">BØX de Todos os Usuários</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pontuação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allBoxes.map((box) => {
                const user = users.find(u => u.id === box.userId)
                return (
                  <tr key={`${box.userId}-${box.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.displayName || user?.email || 'Usuário não encontrado'}
                      </div>
                      <div className="text-sm text-gray-500">{user?.role || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {box.nivel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {box.evento}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {box.data ? new Date(box.data).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {box.pontuacao || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        box.status === 'ativo'
                          ? 'bg-green-100 text-green-800'
                          : box.status === 'pendente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {box.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

## perfil/marketing.tsx

import { useState, useEffect, useCallback } from 'react'

import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import {  db, getAuth  } from '../lib/firebase'
import { useAnalytics } from '../hooks/useAnalytics'
import Header from '../components/header'
import Footer from '../components/Footer'
import type { UserRole } from '../types/firestore';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

// Tipos de usuário
export type Status = 'ativo' | 'pendente' | 'inativo' | 'cancelado' | 'aprovado' | 'rejeitado'

// Categorias de patrocinador
export type CategoriaPatrocinador = 'Ouro' | 'Prata' | 'Bronze' | 'Apoio' | 'Tecnologia' | 'Alimentação' | 'Equipamentos'

// Tipos de audiovisual
export type AudiovisualTipo = 'fotografo' | 'videomaker' | 'jornalista' | 'influencer' | 'youtuber' | 'outro'

// Categorias de competição
export type CategoriaCompeticao = 'Scale' | 'RX' |  'Iniciante' | 'Master 145+' | 'Amador';

// Interfaces específicas
interface UserData {
  uid: string
  email: string
  role: UserRole
  displayName: string
  photoURL?: string
  gamification?: {
    tokens?: {
      box?: {
        balance?: number
      }
    }
    level?: string
    achievements?: string[]
    totalActions?: number
    challenges?: unknown[]
    referralTokens?: number
    rewards?: unknown[]
    streakDays?: number
  }
}

// Interface para UserBox (compatível com sistema dos perfis)
interface UserBox {
  id: string
  userId: string
  nivel: string
  evento: string
  data: Date
  descricao: string
  pontuacao: number
  categoria: string
  status: string
}

interface Stats {
  totalUsers: number
  totalTeams: number
  totalAudiovisual: number
  totalAtletas: number
  totalParceiros: number
  totalPatrocinadores: number
}

interface FirestoreDocument {
  id: string
  [key: string]: unknown
}

// Interfaces específicas para melhor tipagem
interface FirestoreUser extends FirestoreDocument {
  displayName?: string
  email?: string
  role?: UserRole
  status?: Status
}

interface FirestoreTeam extends FirestoreDocument {
  nome?: string
  name?: string
  categoria?: CategoriaCompeticao
  members?: unknown[]
  status?: string
  box?: {
    nome?: string
    cidade?: string
  }
  competition?: {
    resultados?: Array<{
      pontuacao: number
    }>
  }
}

interface FirestoreAudiovisual extends FirestoreDocument {
  displayName?: string
  tipo?: AudiovisualTipo
  aprovado?: boolean
  createdAt?: {
    toDate: () => Date
  }
}

interface FirestorePatrocinador extends FirestoreDocument {
  nome?: string
  nomeFantasia?: string
  categoria?: CategoriaPatrocinador
  valorPatrocinio?: string
  status?: Status
}

// ============================================================================
// CONFIGURAÇÕES DAS TABS
// ============================================================================

const ADMIN_TABS = [
  { id: 'stats', label: '📊 Estatísticas', icon: '📊' },
  { id: 'users', label: '👥 Usuários', icon: '👥' },
  { id: 'teams', label: '🏆 Times', icon: '🏆' },
  { id: 'audiovisual', label: '🎬 Creators', icon: '🎬' },
  { id: 'parceiros', label: '🤝 Parceiros', icon: '🤝' },
  { id: 'leaderboard', label: '🏆 Leaderboard', icon: '🏆' },
  { id: 'marketing', label: '📢 Marketing', icon: '📢' },
  { id: 'perfil', label: '👤 Perfil & Configurações', icon: '👤' }
] as const

const ADMIN_ROLES: UserRole[] = ['admin', 'marketing', 'dev']

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function AdminDashboard() {
  // Estados principais
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>('stats')
  
  // Estados para BØX e gamificação
  const [userBoxes, setUserBoxes] = useState(0)
  const [userBoxesDetails, setUserBoxesDetails] = useState<UserBox[]>([])
  const [loadingBoxes, setLoadingBoxes] = useState(false)
  const [userRanking, setUserRanking] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  
  // Estados dos dados
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTeams: 0,
    totalAudiovisual: 0,
    totalAtletas: 0,
    totalParceiros: 0,
    totalPatrocinadores: 0,
  })
  
  const [users, setUsers] = useState<FirestoreUser[]>([])
  const [teams, setTeams] = useState<FirestoreTeam[]>([])
  const [audiovisual, setAudiovisual] = useState<FirestoreAudiovisual[]>([])
  const [patrocinadores, setPatrocinadores] = useState<FirestorePatrocinador[]>([])
  const [leaderboardProvas, setLeaderboardProvas] = useState<FirestoreTeam[]>([])

  const { trackPage, trackAdmin } = useAnalytics()

  // ============================================================================
  // FUNÇÕES DE CARREGAMENTO DE DADOS
  // ============================================================================

  // Função genérica para buscar coleção
  const fetchCollection = useCallback(async (collectionName: string): Promise<FirestoreDocument[]> => {
    try {
      const snapshot = await getDocs(collection(db, collectionName))
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    } catch (error) {
      console.error(`Erro ao carregar ${collectionName}:`, error)
      return []
    }
  }, [])

  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    try {
      const [usersData, teamsData, audiovisualData, patrocinadoresData] = await Promise.all([
        fetchCollection('users'),
        fetchCollection('teams'),
        fetchCollection('audiovisual'),
        fetchCollection('patrocinadores')
      ])

      const atletasCount = usersData.filter(user => user.role === 'atleta').length
      const parceirosCount = patrocinadoresData.filter(pat => pat.status === 'ativo').length

      setStats({
        totalUsers: usersData.length,
        totalTeams: teamsData.length,
        totalAudiovisual: audiovisualData.length,
        totalAtletas: atletasCount,
        totalParceiros: parceirosCount,
        totalPatrocinadores: patrocinadoresData.length,
      })

      // Salvar dados nas states com tipagem correta
      setUsers(usersData as FirestoreUser[])
      setTeams(teamsData as FirestoreTeam[])
      setAudiovisual(audiovisualData as FirestoreAudiovisual[])
      setPatrocinadores(patrocinadoresData as FirestorePatrocinador[])

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }, [fetchCollection])

  // Carregar leaderboard das provas
  const loadLeaderboardProvas = useCallback(async () => {
    try {
      const teamsData = await fetchCollection('teams') as FirestoreTeam[]
      
      const teamsWithCompetition = teamsData
        .filter((team) => team.competition?.resultados)
        .sort((a, b) => {
          const aTotal = a.competition?.resultados?.reduce((sum, prova) => sum + (prova.pontuacao || 0), 0) || 0
          const bTotal = b.competition?.resultados?.reduce((sum, prova) => sum + (prova.pontuacao || 0), 0) || 0
          return bTotal - aTotal
        })
        .slice(0, 20)
      
      setLeaderboardProvas(teamsWithCompetition)
    } catch (error) {
      console.error('Erro ao carregar leaderboard de provas:', error)
    }
  }, [fetchCollection])

  // Carregar BØX do usuário do Firestore
  const loadUserBoxes = useCallback(async (uid: string) => {
    try {
      setLoadingBoxes(true)
      
      // 🔥 INTEGRAÇÃO COM SISTEMA VALIDADO: Buscar dados de gamificação do usuário
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        setUserBoxesDetails([])
        setUserBoxes(0)
        return
      }
      
      const userData = userDoc.data()
      const achievements = userData?.gamification?.achievements || []
      const tokens = userData?.gamification?.tokens?.box?.balance || 0
      const level = userData?.gamification?.level || 'cindy'
      const totalActions = userData?.gamification?.totalActions || 0
      const challenges = userData?.gamification?.challenges || []
      const referralTokens = userData?.gamification?.referralTokens || 0
      const rewards = userData?.gamification?.rewards || []
      const streakDays = userData?.gamification?.streakDays || 0
      
      // 🎯 Definir saldo de $BØX
      setUserBoxes(tokens)
      
      // 🔥 CONVERTER DADOS REAIS EM BØX VISUAIS (SISTEMA VALIDADO)
      const boxes: UserBox[] = []
      
      // 🏆 BØX por achievements específicos (sistema validado)
      if (achievements.includes('primeiro_pagamento')) {
        boxes.push({
          id: 'primeiro_pagamento',
          userId: uid,
          nivel: 'cindy',
          evento: '🏆 Primeiro Pagamento',
          data: new Date(),
          descricao: 'BÔNUS INAUGURAL - Primeira compra realizada na competição',
          pontuacao: 100,
          categoria: 'Pagamento',
          status: 'ativo'
        })
      }
      
      if (achievements.includes('perfil_completo')) {
        boxes.push({
          id: 'perfil_completo',
          userId: uid,
          nivel: 'helen',
          evento: '📋 Perfil Completo',
          data: new Date(),
          descricao: 'PROFILE MASTER - Dados pessoais 100% preenchidos',
          pontuacao: 50,
          categoria: 'Perfil',
          status: 'ativo'
        })
      }

      if (achievements.includes('first_login')) {
        boxes.push({
          id: 'first_login',
          userId: uid,
          nivel: level,
          evento: '🚪 Primeiro Login',
          data: new Date(),
          descricao: 'Bem-vindo à plataforma! Primeiro acesso realizado.',
          pontuacao: 10,
          categoria: 'Login',
          status: 'ativo'
        })
      }

      // 🎯 BØX por nível atual do usuário (sistema validado)
      const nivelBox = {
        'cindy': { nome: 'A Base', pontos: 50, descricao: 'Fundação sólida estabelecida' },
        'helen': { nome: 'O Fôlego', pontos: 100, descricao: 'Resistência cardiovascular dominada' },
        'fran': { nome: 'O Inferno Curto', pontos: 200, descricao: 'Explosão e intensidade conquistadas' },
        'annie': { nome: 'A Coordenação', pontos: 300, descricao: 'Movimentos complexos dominados' },
        'murph': { nome: 'A Prova Final', pontos: 500, descricao: 'Resistência mental e física testadas' },
        'matt': { nome: 'O Escolhido', pontos: 1000, descricao: 'Elite absoluta da comunidade' }
      }

      const nivelInfo = nivelBox[level as keyof typeof nivelBox]
      if (nivelInfo) {
        boxes.push({
          id: `nivel_${level}`,
          userId: uid,
          nivel: level,
          evento: `🏅 ${nivelInfo.nome}`,
          data: new Date(),
          descricao: `NÍVEL ATUAL: ${nivelInfo.descricao}`,
          pontuacao: nivelInfo.pontos,
          categoria: 'Nível',
          status: 'ativo'
        })
      }

      // 🏅 BØX por challenges (sistema validado)
      challenges.forEach((challenge: { name?: string; description?: string; points?: number }, index: number) => {
        boxes.push({
          id: `challenge_${index}`,
          userId: uid,
          nivel: level,
          evento: `🏅 ${challenge.name || `Desafio #${index + 1}`}`,
          data: new Date(),
          descricao: `Desafio concluído: ${challenge.description || 'Desafio da competição'}`,
          pontuacao: challenge.points || 25,
          categoria: 'Desafio',
          status: 'ativo'
        })
      })
      
      // 👥 BØX por referral (sistema validado)
      if (referralTokens > 0) {
        boxes.push({
          id: 'referral_tokens',
          userId: uid,
          nivel: level,
          evento: '👥 Sistema de Referral',
          data: new Date(),
          descricao: `BØX por convidar amigos: ${referralTokens} tokens ganhos`,
          pontuacao: referralTokens,
          categoria: 'Referral',
          status: 'ativo'
        })
      }
      
      // 🔥 BØX por streak (sistema validado)
      if (streakDays > 0) {
        boxes.push({
          id: 'streak_days',
          userId: uid,
          nivel: level,
          evento: '🔥 Sequência de Login',
          data: new Date(),
          descricao: `Sequência de ${streakDays} dias consecutivos de login`,
          pontuacao: streakDays * 5,
          categoria: 'Streak',
          status: 'ativo'
        })
      }
      
      // 🏅 BØX por recompensas (sistema validado)
      rewards.forEach((reward: { name?: string; description?: string; points?: number }, index: number) => {
        boxes.push({
          id: `reward_${index}`,
          userId: uid,
          nivel: level,
          evento: `🏅 Recompensa: ${reward.name || `#${index + 1}`}`,
          data: new Date(),
          descricao: `Recompensa desbloqueada: ${reward.description || 'Recompensa da competição'}`,
          pontuacao: reward.points || 25,
          categoria: 'Recompensa',
          status: 'ativo'
        })
      })
      
      // 🎯 BØX por total de ações (sistema validado)
      if (totalActions > 0) {
        boxes.push({
          id: 'total_acoes',
          userId: uid,
          nivel: level,
          evento: '🎯 Total de Ações',
          data: new Date(),
          descricao: `${totalActions} ações realizadas na plataforma`,
          pontuacao: totalActions,
          categoria: 'Ações',
          status: 'ativo'
        })
      }

      setUserBoxesDetails(boxes)
      
    } catch (error) {
      console.error('Erro ao carregar BØX:', error)
      setUserBoxesDetails([])
      setUserBoxes(0)
    } finally {
      setLoadingBoxes(false)
    }
  }, [])

  // Carregar dados de gamificação do usuário
  const loadUserGamification = useCallback(async (uid: string) => {
    try {
      // Buscar ranking do usuário
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const allUsers = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        boxTokens: doc.data()?.gamification?.tokens?.box?.balance || 0
      }))
      
      // Ordenar por tokens (maior para menor)
      allUsers.sort((a, b) => b.boxTokens - a.boxTokens)
      
      // Encontrar posição do usuário atual
      const userPosition = allUsers.findIndex(user => user.uid === uid)
      setUserRanking(userPosition + 1)
      setTotalUsers(allUsers.length)
      
    } catch (error) {
      console.error('Erro ao carregar gamificação:', error)
    }
  }, [])

  // Carregar dados do usuário
  const loadUserData = useCallback(async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData
        if (!ADMIN_ROLES.includes(userData.role)) {
          window.location.href = '/admin'
          return
        }
        setUserData(userData)
      } else {
        window.location.href = '/admin'
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
      window.location.href = '/admin'
    }
  }, [])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Autenticação
  useEffect(() => {
    const initializeAuth = async () => {
      const auth = await getAuth()
      const { onAuthStateChanged } = await import('firebase/auth');
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUserData(user.uid)
        await loadUserBoxes(user.uid)
        await loadUserGamification(user.uid)
      } else {
        window.location.href = '/login'
      }
      setLoading(false)
    })
    return unsubscribe;
    };

    initializeAuth().then(unsubscribe => {
      if (unsubscribe) {
        return () => unsubscribe();
      }
    });
  }, [loadUserData, loadUserBoxes, loadUserGamification])

  // Carregar dados após autenticação
  useEffect(() => {
    if (userData && !loading) {
      trackPage()
      trackAdmin()
      loadStats()
      loadLeaderboardProvas()
    }
  }, [userData, loading, trackPage, trackAdmin, loadStats, loadLeaderboardProvas])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleLogout = async () => {
    trackAdmin()
    const auth = await getAuth();
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
    window.location.href = '/'
  }

  // ============================================================================
  // COMPONENTES DE RENDERIZAÇÃO
  // ============================================================================

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-500 mx-auto mb-4"></div>
          <p>Carregando painel...</p>
        </div>
      </div>
    )
  }

  // Access denied
  if (!userData || !ADMIN_ROLES.includes(userData.role)) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <button
            onClick={() => window.location.href = '/admin'}
            className="bg-gradient-to-r from-pink-600 to-blue-600 hover:from-pink-700 hover:to-blue-700 text-white px-4 py-2 rounded transition-all duration-300"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      {/* Background com imagem principal */}
      <div
        className="flex-1 relative"
        style={{
          backgroundImage: 'url(/images/bg_main.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80"></div>

        {/* Conteúdo principal */}
        <div className="relative z-10 container mx-auto px-4 py-8">
          
          {/* Header do Admin */}
          <AdminHeader userData={userData} onLogout={handleLogout} />

          {/* Tabs */}
          <div className="ios-card ios-card-spacious ios-mb-lg">
            
            {/* Navigation Tabs */}
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Tab Content */}
            <TabContent
              activeTab={activeTab}
              stats={stats}
              users={users}
              teams={teams}
              audiovisual={audiovisual}
              patrocinadores={patrocinadores}
              leaderboardProvas={leaderboardProvas}
              userData={userData}
              userBoxes={userBoxes}
              userBoxesDetails={userBoxesDetails}
              loadingBoxes={loadingBoxes}
              userRanking={userRanking}
              totalUsers={totalUsers}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface AdminHeaderProps {
  userData: UserData
  onLogout: () => void
}

function AdminHeader({ userData, onLogout }: AdminHeaderProps) {
  const roleLabels: Record<UserRole, string> = {
    publico: 'Público',
    atleta: 'Atleta',
    judge: 'Judge',
    midia: 'Mídia',
    admin: 'Admin',
    dev: 'Dev',
    marketing: 'Marketing',
    fotografo: 'Fotógrafo',
    espectador: 'Torcida',
    staff: 'Staff'
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-8 border border-white/20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📢 Dashboard de Marketing</h1>
          <p className="text-gray-600">Métricas, usuários e performance da plataforma</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            {roleLabels[userData.role]}
          </span>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}

interface TabNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex space-x-4 mb-6 overflow-x-auto">
      {ADMIN_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-pink-600 to-blue-600 text-white'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

interface TabContentProps {
  activeTab: string
  stats: Stats
  users: FirestoreUser[]
  teams: FirestoreTeam[]
  audiovisual: FirestoreAudiovisual[]
  patrocinadores: FirestorePatrocinador[]
  leaderboardProvas: FirestoreTeam[]
  userData: UserData | null
  userBoxes: number
  userBoxesDetails: UserBox[]
  loadingBoxes: boolean
  userRanking: number
  totalUsers: number
}

function TabContent({ 
  activeTab, 
  stats, 
  users, 
  teams, 
  audiovisual, 
  patrocinadores, 
  leaderboardProvas, 
  userData,
  userBoxes,
  userBoxesDetails,
  loadingBoxes,
  userRanking,
  totalUsers
}: TabContentProps) {
  switch (activeTab) {
    case 'stats':
      return <StatsTab stats={stats} />
    case 'users':
      return <UsersTab users={users} />
    case 'teams':
      return <TeamsTab teams={teams} />
    case 'audiovisual':
      return <AudiovisualTab audiovisual={audiovisual} />
    case 'parceiros':
      return <ParceirosTab patrocinadores={patrocinadores} />
    case 'leaderboard':
      return <LeaderboardTab leaderboardProvas={leaderboardProvas} />
    case 'marketing':
      return <MarketingTab stats={stats} users={users} />
    case 'perfil':
      return (
        <MarketingPerfilTabWrapper 
          userData={userData} 
          userBoxes={userBoxes}
          userBoxesDetails={userBoxesDetails}
          loadingBoxes={loadingBoxes}
          userRanking={userRanking}
          totalUsers={totalUsers}
        />
      )
    default:
      return <StatsTab stats={stats} />
  }
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

const getUserRoleLabel = (role?: UserRole): string => {
  const roleLabels: Record<UserRole, string> = {
    publico: 'Público',
    atleta: 'Atleta',
    judge: 'Judge',
    midia: 'Mídia',
    admin: 'Admin',
    dev: 'Dev',
    marketing: 'Marketing',
    fotografo: 'Fotógrafo',
    espectador: 'Torcida',
    staff: 'Staff'
  };
  return role ? roleLabels[role] : 'N/A';
};

const getCategoriaLabel = (categoria?: CategoriaCompeticao): string => {
  return categoria || 'N/A'
}

const getAudiovisualTipoLabel = (tipo?: AudiovisualTipo): string => {
  const tipoLabels: Record<AudiovisualTipo, string> = {
    'fotografo': 'Fotógrafo',
    'videomaker': 'Videomaker',
    'jornalista': 'Jornalista',
    'influencer': 'Influencer',
    'youtuber': 'Youtuber',
    'outro': 'Outro'
  }
  return tipo ? tipoLabels[tipo] : 'N/A'
}

const getStatusLabel = (status?: string): string => {
  const statusLabels: Record<string, string> = {
    'incomplete': 'Incompleto',
    'complete': 'Completo',
    'confirmado': 'Confirmado',
    'cancelado': 'Cancelado',
    'ativo': 'Ativo',
    'pendente': 'Pendente',
    'inativo': 'Inativo'
  }
  return status ? statusLabels[status] || status : 'N/A'
}

// Stats Tab
function StatsTab({ stats }: { stats: Stats }) {
  const statsCards = [
    { label: 'Total de Usuários', value: stats.totalUsers, icon: '👥', gradient: 'from-blue-500 to-blue-600' },
    { label: 'Total de Times', value: stats.totalTeams, icon: '🏆', gradient: 'from-green-500 to-green-600' },
    { label: 'Total de Atletas', value: stats.totalAtletas, icon: '🏃', gradient: 'from-yellow-500 to-yellow-600' },
    { label: 'Audiovisual', value: stats.totalAudiovisual, icon: '🎬', gradient: 'from-purple-500 to-purple-600' },
    { label: 'Parceiros Ativos', value: stats.totalParceiros, icon: '🤝', gradient: 'from-pink-500 to-pink-600' },
    { label: 'Total Patrocinadores', value: stats.totalPatrocinadores, icon: '💎', gradient: 'from-indigo-500 to-indigo-600' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsCards.map((card, index) => (
        <div key={index} className={`bg-gradient-to-r ${card.gradient} rounded-lg p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{card.label}</p>
              <p className="text-3xl font-bold">{card.value}</p>
            </div>
            <div className="text-3xl">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Users Tab
function UsersTab({ users }: { users: FirestoreUser[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuário
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.slice(0, 20).map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {user.displayName || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {user.email || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {getUserRoleLabel(user.role)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Ativo
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Teams Tab
function TeamsTab({ teams }: { teams: FirestoreTeam[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoria
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Membros
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {teams.slice(0, 20).map((team) => (
            <tr key={team.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {team.nome || team.name || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                  {getCategoriaLabel(team.categoria)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {Array.isArray(team.members) ? team.members.length : 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {getStatusLabel(team.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Audiovisual Tab
function AudiovisualTab({ audiovisual }: { audiovisual: FirestoreAudiovisual[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Profissional
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {audiovisual.slice(0, 20).map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {item.displayName || 'N/A'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs">
                  {getAudiovisualTipoLabel(item.tipo)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  item.aprovado === true ? 'bg-green-100 text-green-800'
                    : item.aprovado === false ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.aprovado === true ? 'Aprovado'
                    : item.aprovado === false ? 'Rejeitado' : 'Pendente'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Parceiros Tab
function ParceirosTab({ patrocinadores }: { patrocinadores: FirestorePatrocinador[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Parceiro
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoria
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {patrocinadores.slice(0, 20).map((patrocinador) => (
            <tr key={patrocinador.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {patrocinador.nome || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  {patrocinador.nomeFantasia}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                  {patrocinador.categoria || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                R$ {patrocinador.valorPatrocinio || '0,00'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  patrocinador.status === 'ativo'
                    ? 'bg-green-100 text-green-800'
                    : patrocinador.status === 'pendente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(patrocinador.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Leaderboard Tab
function LeaderboardTab({ leaderboardProvas }: { leaderboardProvas: FirestoreTeam[] }) {
  if (leaderboardProvas.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🏆</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum resultado disponível</h3>
        <p className="text-gray-500">Os resultados das provas aparecerão aqui em tempo real durante o evento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-4 text-white">
        <h3 className="text-lg font-bold mb-2">🏆 Leaderboard das Provas - Tempo Real</h3>
        <p className="text-sm text-gray-600 mb-4">Ranking das competições esportivas (diferente do sistema de gamificação $BOX)</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Posição
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pontuação Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Provas
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboardProvas.map((team, index) => {
              const totalPontos = team.competition?.resultados?.reduce((sum, prova) => sum + (prova.pontuacao || 0), 0) || 0
              const provasCount = team.competition?.resultados?.length || 0
              
              return (
                <tr key={team.id} className={index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                      {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                      {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                      <span className={`text-lg font-bold ${
                        index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-gray-600' :
                        index === 2 ? 'text-orange-600' : 'text-gray-900'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {team.nome || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {team.box?.nome} - {team.box?.cidade}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      {getCategoriaLabel(team.categoria)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-green-600">
                      {totalPontos} pts
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {provasCount} provas
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Marketing Tab - Nova aba específica para marketing
function MarketingTab({ stats, users }: { stats: Stats; users: FirestoreUser[] }) {
  // Calcular métricas específicas de marketing
  const totalUsers = stats.totalUsers
  const activeUsers = users.filter(u => u.status !== 'inativo').length
  const newUsersThisWeek = users.filter(u => {
    if (u.createdAt) {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      let createdAt: Date
      if (typeof u.createdAt === 'string') {
        createdAt = new Date(u.createdAt)
      } else if (u.createdAt && typeof u.createdAt === 'object' && 'toDate' in u.createdAt) {
        createdAt = (u.createdAt as { toDate: () => Date }).toDate()
      } else {
        createdAt = u.createdAt as unknown as Date
      }
      return createdAt >= oneWeekAgo
    }
    return false
  }).length
  
  const userEngagement = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
  const conversionRate = totalUsers > 0 ? Math.round((newUsersThisWeek / totalUsers) * 100) : 0

  // Calcular distribuição por tipo de usuário
  const roleCounts = users.reduce((acc, user) => {
    acc[user.role || 'publico'] = (acc[user.role || 'publico'] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topUserTypes = Object.entries(roleCounts)
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📢 Métricas de Marketing</h2>
      
      {/* KPIs Principais de Marketing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total de Usuários</p>
              <p className="text-3xl font-bold">{totalUsers}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Usuários Ativos</p>
              <p className="text-3xl font-bold">{activeUsers}</p>
            </div>
            <div className="text-3xl">✅</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Novos esta Semana</p>
              <p className="text-3xl font-bold">{newUsersThisWeek}</p>
            </div>
            <div className="text-3xl">🆕</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Engajamento</p>
              <p className="text-3xl font-bold">{userEngagement}%</p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Taxa de Conversão</p>
              <p className="text-3xl font-bold">{conversionRate}%</p>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Top Tipo</p>
              <p className="text-3xl font-bold">
                {topUserTypes[0]?.role || 'N/A'}
              </p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Análise de Tipos de Usuário */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Distribuição por Tipo de Usuário</h3>
        <div className="space-y-4">
          {topUserTypes.map((type, index) => (
            <div key={type.role} className="flex items-center justify-between">
              <span className="text-gray-700">
                {index === 0 && '🥇'} {index === 1 && '🥈'} {index === 2 && '🥉'}
                {getUserRoleLabel(type.role as UserRole)}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-purple-600">{type.count}</span>
                <span className="text-sm text-gray-500">usuários</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendações de Marketing */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-800 mb-4">💡 Recomendações de Marketing</h3>
        <div className="space-y-3">
          {conversionRate < 10 && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
              <strong>📈 Taxa de Conversão Baixa:</strong> {conversionRate}% - Revisar CTA, testar diferentes abordagens
            </div>
          )}
          
          {userEngagement < 70 && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg">
              <strong>🎯 Engajamento Baixo:</strong> {userEngagement}% - Implementar campanhas de re-engajamento
            </div>
          )}
          
          {newUsersThisWeek < 5 && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
              <strong>🚀 Poucos Novos Usuários:</strong> {newUsersThisWeek} esta semana - Acelerar campanhas de aquisição
            </div>
          )}
          
          {topUserTypes[0]?.role === 'espectador' && (
            <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-3 rounded-lg">
              <strong>🎭 Foco em Espectadores:</strong> Maioria dos usuários são espectadores - Desenvolver conteúdo específico
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Wrapper para MarketingPerfilTab com funções auxiliares
function MarketingPerfilTabWrapper({ 
  userData, 
  userBoxes, 
  userBoxesDetails, 
  loadingBoxes, 
  userRanking, 
  totalUsers 
}: { 
  userData: UserData | null
  userBoxes: number
  userBoxesDetails: UserBox[]
  loadingBoxes: boolean
  userRanking: number
  totalUsers: number
}) {
  // Função para obter ícone baseado no nível
  const getBoxIcon = (nivel: string) => {
    const icones = {
      'cindy': '/images/levels/cindy.webp',
      'helen': '/images/levels/helen.webp', 
      'fran': '/images/levels/fran.webp',
      'annie': '/images/levels/annie.webp',
      'murph': '/images/levels/murph.webp',
      'matt': '/images/levels/matt.webp'
    }
    return icones[nivel as keyof typeof icones] || '/images/levels/default.webp'
  }

  // Função para calcular progresso do perfil
  const getProfileProgress = () => {
    if (!userData) return 0
    
    let completedFields = 0
    const totalFields = 5
    
    if (userData.displayName) completedFields++
    if (userData.email) completedFields++
    if (userData.photoURL) completedFields++
    if (userData.role) completedFields++
    if (userData.gamification?.level) completedFields++
    
    return Math.round((completedFields / totalFields) * 100)
  }

  if (!userData) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Carregando dados do usuário...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 p-6">
      {/* 🎯 Header do Perfil - iOS Style */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          {/* Avatar e Informações do Usuário */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white/20">
              {userData.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-white font-bold text-2xl">
                  {userData.displayName?.charAt(0).toUpperCase() || 'M'}
                </div>
              )}
            </div>
            
            <div>
              <h2 className="text-xl font-bold">{userData.displayName}</h2>
              <p className="text-purple-100 text-sm flex items-center">
                <span className="mr-1">📢</span>
                {userData.role?.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Saldo $BØX */}
          <div className="text-right">
            <div className="text-3xl font-bold">{userBoxes}</div>
            <div className="text-purple-100 text-sm">$BØX</div>
          </div>
        </div>
        
        {/* Nível e Ranking */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm text-purple-100">Seu Nível:</span>
            <div className="bg-white/20 px-4 py-2 rounded-full flex items-center space-x-2">
              <img 
                src={getBoxIcon(userData.gamification?.level || 'cindy')} 
                alt={`Nível ${userData.gamification?.level || 'cindy'}`}
                className="w-6 h-6 object-contain"
              />
              <span className="font-semibold">{userData.gamification?.level || 'Iniciante'}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-purple-100 mb-1">Ranking</div>
            <div className="text-lg font-bold">
              #{userRanking > 0 ? userRanking : 'N/A'}/{totalUsers > 0 ? totalUsers : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 Seção de Conquistas e Missões */}
      <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <span className="mr-2">🏆</span>
            Conquistas & Missões
          </h3>
        </div>
        
        <div className="p-6">
          {/* Conquistas Ativas */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🏆</span>
              Conquistas Ativas
            </h4>
            
            {loadingBoxes ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
              </div>
            ) : userBoxesDetails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userBoxesDetails.slice(0, 4).map((box) => (
                  <div key={box.id} className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border border-pink-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-semibold text-gray-800 text-sm">{box.evento}</h5>
                      <span className="text-pink-600 font-bold text-lg">+{box.pontuacao}</span>
                    </div>
                    <p className="text-gray-600 text-xs">{box.descricao}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                      {box.categoria}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 p-4">
                <span className="text-4xl block mb-2">🎯</span>
                Nenhuma conquista encontrada
              </div>
            )}
          </div>

          {/* Missões Pendentes */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🎯</span>
              Missões Pendentes
            </h4>
            
            <div className="space-y-3">
              {/* Missão: Foto do Perfil */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📸</span>
                  <div>
                    <h5 className="font-semibold text-gray-800">Foto do Perfil</h5>
                    <p className="text-gray-600 text-sm">Adicione uma foto ao seu perfil</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-blue-600 font-bold">+25 $BØX</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    userData.photoURL 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {userData.photoURL ? 'Concluída' : 'Pendente'}
                  </span>
                </div>
              </div>

              {/* Missão: Perfil Completo */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h5 className="font-semibold text-gray-800">Perfil Completo</h5>
                    <p className="text-gray-600 text-sm">Complete todas as informações</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-bold">+15 $BØX</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    Em Progresso
                  </span>
                </div>
              </div>

              {/* Missão: Marketing Ace */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📢</span>
                  <div>
                    <h5 className="font-semibold text-gray-800">Marketing Ace</h5>
                    <p className="text-gray-600 text-sm">Analyze todas as métricas de marketing</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-purple-600 font-bold">+50 $BØX</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    Bloqueada
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progresso do Cadastro */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Progresso do Cadastro
            </h4>
            
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Completude do Perfil</span>
                <span className="font-bold text-gray-800">{getProfileProgress()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProfileProgress()}%` }}
                ></div>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                {getProfileProgress() === 100 
                  ? '🎉 Perfil 100% completo!' 
                  : `Faltam ${100 - getProfileProgress()}% para completar`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🛠️ Configurações e Gestão */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-600 to-gray-800 p-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <span className="mr-2">⚙️</span>
            Configurações Marketing
          </h3>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Gestão de Campanhas */}
          <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📢</span>
                <div>
                  <h5 className="font-semibold text-gray-800">Gestão de Campanhas</h5>
                  <p className="text-gray-600 text-sm">Configure campanhas e métricas</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors">
                Gerenciar
              </button>
            </div>
          </div>

          {/* Analytics Avançados */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📊</span>
                <div>
                  <h5 className="font-semibold text-gray-800">Analytics Avançados</h5>
                  <p className="text-gray-600 text-sm">Relatórios detalhados de performance</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Analisar
              </button>
            </div>
          </div>

          {/* Automações */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h5 className="font-semibold text-gray-800">Automações</h5>
                  <p className="text-gray-600 text-sm">Configure fluxos automatizados</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Configurar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
