import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Tipos
interface UserData {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  photo_url?: string;
  whatsapp?: string;
  box?: string;
  cidade?: string;
  mensagem?: string;
  gamification?: {
    level?: string;
    tokens?: {
      box?: {
        balance?: number;
      };
    };
  };
}

interface User {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string;
  profile_complete: boolean;
}

const ADMIN_TABS = [
  { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
  { id: 'users', label: '👥 Usuários', icon: '👥' },
  { id: 'teams', label: '🏆 Times', icon: '🏆' },
  { id: 'events', label: '📅 Eventos', icon: '📅' },
  { id: 'settings', label: '⚙️ Configurações', icon: '⚙️' }
];

export default function Admin() {
  const { user } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estados dos dados
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    totalEvents: 0,
    activeUsers: 0
  });

  // Carregar dados do usuário
  const loadUserData = useCallback(async (userId: string) => {
    try {
      console.log('🔄 Carregando dados do usuário:', userId);
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao carregar usuário:', error);
        return;
      }

      console.log('📖 Dados carregados do Supabase:', userData);
      setUserData(userData);

    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
    }
  }, []);

  // Carregar dados administrativos
  const loadAdminData = useCallback(async () => {
    try {
      // Carregar usuários
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (usersData) {
        setUsers(usersData);
      }

      // Carregar estatísticas
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: teamsCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true });

      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalTeams: teamsCount || 0,
        totalEvents: eventsCount || 0,
        activeUsers: usersCount ? Math.floor(usersCount * 0.7) : 0 // Placeholder
      });

    } catch (error) {
      console.error('Erro ao carregar dados administrativos:', error);
    }
  }, []);

  // Effects
  useEffect(() => {
    if (user) {
      loadUserData(user.id);
      loadAdminData();
      setLoading(false);
    }
  }, [user, loadUserData, loadAdminData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!userData || userData.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-300 mb-4">Esta página é exclusiva para administradores.</p>
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
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header do Dashboard */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">👑</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-300">Gerencie usuários, times e eventos</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">Admin</div>
              <div className="text-white">{userData.display_name}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6">
          <div className="flex space-x-2 overflow-x-auto">
            {ADMIN_TABS.map((tab) => (
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
            stats={stats}
            users={users}
          />
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}

interface TabContentProps {
  activeTab: string;
  stats: {
    totalUsers: number;
    totalTeams: number;
    totalEvents: number;
    activeUsers: number;
  };
  users: User[];
}

function TabContent({ activeTab, stats, users }: TabContentProps) {
  switch (activeTab) {
    case 'dashboard':
      return <DashboardTab stats={stats as DashboardStats | any} />;
    case 'users':
      return <UsersTab users={users} />;
    case 'teams':
      return <TeamsTab />;
    case 'events':
      return <EventsTab />;
    case 'settings':
      return <SettingsTab />;
    default:
      return <DashboardTab stats={ stats as DashboardStats | any } />;
  }
}

// Interface para estatísticas do dashboard
interface DashboardStats {
  totalUsers: number;
  totalTeams: number;
  totalEvents: number;
  totalTokens: number;
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    user: string;
  }>;
}

// Dashboard Tab
function DashboardTab({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total de Usuários</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Times</p>
              <p className="text-3xl font-bold">{stats.totalTeams}</p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Eventos</p>
              <p className="text-3xl font-bold">{stats.totalEvents}</p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Usuários Ativos</p>
              <p className="text-3xl font-bold">{stats.activeUsers as number}</p>
            </div>
            <div className="text-3xl">🔥</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Crescimento de Usuários</h3>
          <div className="h-64 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center">
            <p className="text-gray-400">Gráfico em desenvolvimento</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Distribuição por Role</h3>
          <div className="h-64 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
            <p className="text-gray-400">Gráfico em desenvolvimento</p>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            👥 Gerenciar Usuários
          </button>
          <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            🏆 Gerenciar Times
          </button>
          <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            📅 Gerenciar Eventos
          </button>
          <button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            ⚙️ Configurações
          </button>
        </div>
      </div>
    </div>
  );
}

// Users Tab
function UsersTab({ users }: { users: User[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Usuários</h2>
            <p className="text-blue-100">Gerencie todos os usuários da plataforma</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{users.length}</p>
            <p className="text-blue-100 text-sm">Total</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Data de Registro
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-white/10">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-white">{user.display_name}</p>
                    <p className="text-sm text-gray-300">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.profile_complete ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {user.profile_complete ? 'Completo' : 'Incompleto'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-pink-400 hover:text-pink-300 text-sm font-medium">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Teams Tab
function TeamsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Times</h2>
        <p className="text-green-100">Gerencie times e equipes</p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Gerenciamento de Times</h3>
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🏆</div>
          <p className="text-lg font-medium mb-2">Sistema de Times</p>
          <p className="text-sm">Funcionalidade em desenvolvimento</p>
        </div>
      </div>
    </div>
  );
}

// Events Tab
function EventsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Eventos</h2>
        <p className="text-purple-100">Gerencie eventos e competições</p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Gerenciamento de Eventos</h3>
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-lg font-medium mb-2">Sistema de Eventos</p>
          <p className="text-sm">Funcionalidade em desenvolvimento</p>
        </div>
      </div>
    </div>
  );
}

// Settings Tab
function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Configurações</h2>
        <p className="text-yellow-100">Configure a plataforma</p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Configurações do Sistema</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <span className="text-gray-300">Manutenção</span>
            <button className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
              Ativar
            </button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <span className="text-gray-300">Backup Automático</span>
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
              Configurar
            </button>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-300">Logs do Sistema</span>
            <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">
              Visualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
