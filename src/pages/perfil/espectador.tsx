import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useClerkSupabase } from '../../hooks/useClerkSupabase';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import UserHeader from '../../components/UserHeader';

// Tipos
import type { User, UserGamification } from '../../types/supabase';
import { UserData } from '@/types/user';

interface Team {
  id: string;
  nome: string;
  categoria?: string;
  status?: string;
  members?: string[];
  captain_id?: string;
}

const ESPECTADOR_TABS = [
  { id: 'profile', label: '▞ Meu Perfil', icon: '▞' },
  { id: 'leaderboard', label: '◘ Leaderboard', icon: '◘' },
  { id: 'convites', label: '▟ Sistema de Convites', icon: '▟' },
  { id: 'comunidade', label: '▚ Comunidade', icon: '▚' }
];

export default function PerfilEspectador() {
  const { user } = useClerkUser();
  const { user: userData, gamification, loading: userLoading } = useClerkSupabase();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Estados dos dados
  const [leaderboardProvas, setLeaderboardProvas] = useState<Team[]>([]);

  // Carregar dados do usuário
  const loadUserData = useCallback(async (userId: string) => {
    try {
      console.log('🔄 Carregando dados do usuário:', userId);

      // Carregar eventos do usuário (simulado por enquanto)
      // TODO: Implementar quando tivermos tabela de eventos

    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
    }
  }, []);

  // Carregar leaderboard das provas
  const loadLeaderboardProvas = useCallback(async () => {
    try {
      // TODO: Implementar quando tivermos tabela de teams
      setLeaderboardProvas([]);
    } catch (error) {
      console.error('Erro ao carregar leaderboard de provas:', error);
    }
  }, []);

  // Effects
  useEffect(() => {
    if (user && userData) {
      loadUserData(user.id);
      loadLeaderboardProvas();
      setLoading(false);
    }
  }, [user, userData, loadUserData, loadLeaderboardProvas]);

  // Loading state
  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!userData || (userData.role !== 'espectador' && userData.role !== 'publico')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-300 mb-4">Esta página é exclusiva para espectadores.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white px-4 py-2 rounded transition-all duration-300"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0]">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header do Perfil */}
        <UserHeader 
          showGamification={true}
          showRole={true}
          className="mb-6"
        />

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6">
          <div className="flex space-x-2 overflow-x-auto">
            {ESPECTADOR_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <TabContent 
            activeTab={activeTab} 
            userData={mapToUserData(userData)} 
            leaderboardProvas={leaderboardProvas}
            gamification={gamification}
          />
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

// Interface para dados do usuário do Clerk + Supabase
function mapToUserData(user: any): UserData {
  return {
    id: user.id,
    clerkUserId: user.clerkId || "",
    clerk_id: user.clerkId || "", // adapte conforme a origem
    email: user.email,
    display_name: user.name || "",
    lastName: user.lastName || "",
    fullName: user.fullName || "",
    avatarUrl: user.image,
    role: user.role,
    photo_url: user.image,
    is_active: user.isActive,
    test_user: user.testUser,
    profile_complete: user.profileComplete,
    boxTokens: user.tokens || 0,
    level: user.level || "cindy",
    achievements: user.achievements,
    badges: user.badges,
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };
}

interface TabContentProps {
  activeTab: string;
  userData: UserData;
  leaderboardProvas: Team[];
  gamification: UserGamification;
}

function TabContent({ activeTab, userData, leaderboardProvas, gamification }: TabContentProps) {
  switch (activeTab) {
    case 'profile':
      return <ProfileTab userData={userData} gamification={gamification} />;
    case 'leaderboard':
      return <LeaderboardTab leaderboardProvas={leaderboardProvas} />;
    case 'convites':
      return <ConvitesTab userData={userData} />;
    case 'comunidade':
      return <ComunidadeTab userData={userData} />;
    default:
      return <ProfileTab userData={userData} gamification={gamification} />;
  }
}

// Profile Tab
function ProfileTab({ userData, gamification }: { userData: UserData; gamification: UserGamification }) {
  return (
    <div className="space-y-6">
      {/* Header do Perfil - iOS Style */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Meu Perfil</h2>
              <p className="text-green-100 text-sm">Detalhes da sua conta e conquistas</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{gamification?.box_tokens || 0}</div>
            <div className="text-green-100 text-sm">$BØX</div>
          </div>
        </div>
        
        {/* Status do Usuário */}
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100 mb-1">Seu Status</p>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                  👥 Espectador
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-100 mb-1">Conquistas</p>
              <p className="text-lg font-bold">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas do Usuário */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-green-400 mr-2">📊</span>
          Estatísticas
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-300">{gamification?.box_tokens || 0}</div>
            <div className="text-sm text-green-200">$BØX Total</div>
          </div>
          <div className="bg-emerald-500/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-300">0</div>
            <div className="text-sm text-emerald-200">Conquistas</div>
          </div>
        </div>
      </div>

      {/* Conquistas Conquistadas */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-xl">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <span className="mr-2">🏆</span>
          Minhas Conquistas
        </h3>
        <p className="text-green-100 text-sm mb-6">$BØX já conquistados: {gamification?.box_tokens || 0}</p>
        
        {/* Primeira Conquista - Cadastro */}
        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <div>
                <p className="font-semibold text-white">Primeiro Cadastro</p>
                <p className="text-green-200 text-sm">Você se cadastrou na plataforma!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-green-300">+25</div>
              <div className="text-green-200 text-sm">$BØX</div>
            </div>
          </div>
        </div>
        
        {/* Conquista do Avatar */}
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <p className="font-semibold text-white">Avatar Personalizado</p>
                <p className="text-green-200 text-sm">Você escolheu seu avatar!</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-300">+10</div>
              <div className="text-green-200 text-sm">$BØX</div>
            </div>
          </div>
        </div>
      </div>

      {/* Missões Pendentes */}
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
          {/* Missão: Primeira Interação na Comunidade */}
          <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <p className="font-bold text-lg">Primeira Interação</p>
                  <p className="text-blue-100 text-sm">Interaja com a comunidade</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-300">30</div>
                <div className="text-blue-100 text-sm">$BØX</div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30 mt-2 backdrop-blur-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Disponível
                </span>
              </div>
            </div>
          </div>

          {/* Missão: Convidar Amigos */}
          <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <div>
                  <p className="font-bold text-lg">Convide Amigos</p>
                  <p className="text-blue-100 text-sm">Convide 3 amigos para a plataforma</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-300">100</div>
                <div className="text-blue-100 text-sm">$BØX</div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-400/30 mt-2 backdrop-blur-sm">
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                  Disponível
                </span>
              </div>
            </div>
          </div>

          {/* Missão: Participar de Eventos */}
          <div className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-[1.02] hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <p className="font-bold text-lg">Primeira Participação</p>
                  <p className="text-blue-100 text-sm">Participe do seu primeiro evento</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-300">50</div>
                <div className="text-blue-100 text-sm">$BØX</div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-400/30 mt-2 backdrop-blur-sm">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                  Disponível
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="text-green-400 mr-2">🔥</span>
          Informações da Conta
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <span className="text-gray-300">Nome</span>
            <span className="font-medium text-white">{userData.display_name}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <span className="text-gray-300">Email</span>
            <span className="font-medium text-white">{userData.email}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-300">Função</span>
            <span className="font-medium text-white">{userData.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Leaderboard Tab
function LeaderboardTab({ leaderboardProvas }: { leaderboardProvas: Team[] }) {
  // ============================================================================
  // 🚧 BETA FEATURES - LEADERBOARD EM TEMPO REAL
  // ============================================================================
  // Status: Estrutura pronta, aguardando integração com dados reais
  // Prioridade: Média
  // Estimativa: 1-2 sprints
  // Dependências: Sistema de pontuação, dados de times em tempo real
  // ============================================================================

  if (leaderboardProvas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🏆</div>
        <h3 className="text-2xl font-bold text-white mb-4">Resultados em Breve!</h3>
        <p className="text-gray-300 text-lg">
          Os resultados das provas aparecerão aqui em tempo real durante o evento.
        </p>
        <div className="mt-8 text-sm text-gray-400">
          <p>Acompanhe as equipes competindo pelas melhores posições!</p>
        </div>
        <div className="mt-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-400/30">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-2"></span>
            BETA - Aguardando dados reais
          </span>
        </div>
      </div>
    );
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
      
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Posição
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-white/10">
            {leaderboardProvas.map((team, index) => (
              <tr key={team.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  #{index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                  {team.nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {team.categoria || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {team.status || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Convites Tab
function ConvitesTab({ userData }: { userData: UserData }) {
  // ============================================================================
  // 🚧 BETA FEATURES - SISTEMA DE CONVITES
  // ============================================================================
  // Status: Estrutura pronta, aguardando integração com backend
  // Prioridade: Alta
  // Estimativa: 1 sprint
  // Dependências: Tabela 'invites' no Supabase, sistema de recompensas
  // Problema: Sistema não está funcionando - precisa investigar integração
  // ============================================================================

  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [convitesEnviados, setConvitesEnviados] = useState(0);
  const [convitesAceitos, setConvitesAceitos] = useState(0);

  const handleEnviarConvite = async () => {
    if (!email) {
      alert('Por favor, insira um email válido');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Implementar integração real com Supabase
      // TODO: Criar registro na tabela 'invites'
      // TODO: Enviar email de convite
      // TODO: Implementar sistema de recompensa (25 BOX por convite aceito)
      
      console.log('🚧 BETA: Enviando convite para:', email);
      console.log('🚧 BETA: Mensagem:', mensagem);
      
      // Simulação de envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConvitesEnviados(prev => prev + 1);
      setEmail('');
      setMensagem('');
      
      alert('Convite enviado com sucesso! (Funcionalidade Beta)');
      
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      alert('Erro ao enviar convite. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">📨</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Sistema de Convites</h2>
            <p className="text-orange-100 text-sm">Convide amigos e ganhe $BØX!</p>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-100 mb-1">Convites Enviados</p>
              <p className="text-2xl font-bold">{convitesEnviados}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-orange-100 mb-1">Convites Aceitos</p>
              <p className="text-lg font-bold">{convitesAceitos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recompensas */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <span className="mr-2">🎁</span>
          Recompensas por Convite
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-300">25</div>
            <div className="text-green-200 text-sm">$BØX por convite aceito</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-300">100</div>
            <div className="text-green-200 text-sm">$BØX por 5 convites aceitos</div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <span className="text-orange-400 mr-3">📧</span>
          Enviar Convite
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 ml-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mr-1"></span>
            BETA
          </span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email do Convidado</label>
            <input
              type="email"
              placeholder="convidado@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mensagem (opcional)</label>
            <textarea
              placeholder="Convide alguém para participar!"
              rows={3}
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
            />
          </div>
          <button 
            onClick={handleEnviarConvite}
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? '⏳ Enviando...' : '📧 Enviar Convite'}
          </button>
        </div>

        {/* Aviso Beta */}
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-yellow-300 text-sm">
            <span className="font-semibold">⚠️ Funcionalidade Beta:</span> O sistema de convites está em desenvolvimento. 
            Os convites são simulados e não geram emails reais ainda.
          </p>
        </div>
      </div>
    </div>
  );
}

// Comunidade Tab
function ComunidadeTab({ userData }: { userData: UserData }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Comunidade</h2>
            <p className="text-green-100 text-sm">Conecte-se com outros espectadores</p>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100 mb-1">Membros Ativos</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-100 mb-1">Suas Interações</p>
              <p className="text-lg font-bold">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <span className="text-green-400 mr-3">📋</span>
          Recursos da Comunidade
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-500/20 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-2">💬 Chat da Comunidade</h4>
            <p className="text-green-200 text-sm">Converse com outros espectadores</p>
          </div>
          <div className="bg-emerald-500/20 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-2">📢 Anúncios</h4>
            <p className="text-emerald-200 text-sm">Fique por dentro das novidades</p>
          </div>
          <div className="bg-blue-500/20 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-2">🎯 Enquetes</h4>
            <p className="text-blue-200 text-sm">Participe de votações da comunidade</p>
          </div>
          <div className="bg-purple-500/20 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-2">🏆 Rankings</h4>
            <p className="text-purple-200 text-sm">Veja os rankings da comunidade</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <span className="text-emerald-400 mr-3">📊</span>
          Histórico de Interações
        </h3>
        
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-lg font-medium mb-2">Nenhuma Interação</p>
          <p className="text-sm">Você ainda não interagiu com a comunidade</p>
        </div>
      </div>
    </div>
  );
}
