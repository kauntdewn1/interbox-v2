import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Tipos
interface UserData {
  id: string;
  email: string;
  display_name: string;
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

interface Patrocinador {
  id: string;
  nome: string;
  empresa: string;
  categoria: string;
  email: string;
  telefone: string;
  status: string;
  created_at: string;
}

const MARKETING_TABS = [
  { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
  { id: 'patrocinadores', label: '🤝 Patrocinadores', icon: '🤝' },
  { id: 'analytics', label: '📈 Analytics', icon: '📈' },
  { id: 'campanhas', label: '🎯 Campanhas', icon: '🎯' }
];

export default function Marketing() {
  const { user } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estados dos dados
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatrocinadores: 0,
    totalRevenue: 0,
    conversionRate: 0
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

  // Carregar dados de marketing
  const loadMarketingData = useCallback(async () => {
    try {
      // Carregar patrocinadores
      const { data: patrocinadoresData } = await supabase
        .from('patrocinadores')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (patrocinadoresData) {
        setPatrocinadores(patrocinadoresData);
      }

      // Carregar estatísticas
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: patrocinadoresCount } = await supabase
        .from('patrocinadores')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalPatrocinadores: patrocinadoresCount || 0,
        totalRevenue: 0, // Placeholder
        conversionRate: usersCount && patrocinadoresCount ? (patrocinadoresCount / usersCount) * 100 : 0
      });

    } catch (error) {
      console.error('Erro ao carregar dados de marketing:', error);
    }
  }, []);

  // Effects
  useEffect(() => {
    if (user) {
      loadUserData(user.id);
      loadMarketingData();
      setLoading(false);
    }
  }, [user, loadUserData, loadMarketingData]);

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
  if (!userData || userData.role !== 'marketing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-300 mb-4">Esta página é exclusiva para marketing.</p>
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
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header do Dashboard */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Marketing Dashboard</h1>
              <p className="text-gray-300">Gerencie campanhas e analise dados</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">Última atualização</div>
              <div className="text-white">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6">
          <div className="flex space-x-2 overflow-x-auto">
            {MARKETING_TABS.map((tab) => (
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
            patrocinadores={patrocinadores}
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
    totalPatrocinadores: number;
    totalRevenue: number;
    conversionRate: number;
  };
  patrocinadores: Patrocinador[];
}

function TabContent({ activeTab, stats, patrocinadores }: TabContentProps) {
  switch (activeTab) {
    case 'dashboard':
      return <DashboardTab stats={stats} />;
    case 'patrocinadores':
      return <PatrocinadoresTab patrocinadores={patrocinadores} />;
    case 'analytics':
      return <AnalyticsTab stats={stats} />;
    case 'campanhas':
      return <CampanhasTab />;
    default:
      return <DashboardTab stats={stats} />;
  }
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
              <p className="text-green-100 text-sm">Patrocinadores</p>
              <p className="text-3xl font-bold">{stats.totalPatrocinadores}</p>
            </div>
            <div className="text-3xl">🤝</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Receita Total</p>
              <p className="text-3xl font-bold">R$ {stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Taxa de Conversão</p>
              <p className="text-3xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="text-3xl">📈</div>
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
          <h3 className="text-lg font-semibold text-white mb-4">Patrocinadores por Categoria</h3>
          <div className="h-64 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
            <p className="text-gray-400">Gráfico em desenvolvimento</p>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            📧 Enviar Newsletter
          </button>
          <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            📊 Gerar Relatório
          </button>
          <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            🎯 Nova Campanha
          </button>
        </div>
      </div>
    </div>
  );
}

// Patrocinadores Tab
function PatrocinadoresTab({ patrocinadores }: { patrocinadores: Patrocinador[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Patrocinadores</h2>
            <p className="text-green-100">Gerencie interessados em patrocínio</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{patrocinadores.length}</p>
            <p className="text-green-100 text-sm">Total</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Contato
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                Data
              </th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-white/10">
            {patrocinadores.map((patrocinador) => (
              <tr key={patrocinador.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm font-medium text-white">{patrocinador.empresa}</p>
                    <p className="text-sm text-gray-300">{patrocinador.nome}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="text-sm text-white">{patrocinador.email}</p>
                    <p className="text-sm text-gray-300">{patrocinador.telefone}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300">
                    {patrocinador.categoria}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    patrocinador.status === 'novo' ? 'bg-yellow-500/20 text-yellow-300' :
                    patrocinador.status === 'contatado' ? 'bg-blue-500/20 text-blue-300' :
                    patrocinador.status === 'fechado' ? 'bg-green-500/20 text-green-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {patrocinador.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(patrocinador.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Analytics Tab
function AnalyticsTab({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Analytics</h2>
        <p className="text-purple-100">Análise detalhada de dados e métricas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Métricas Principais</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Taxa de Conversão</span>
              <span className="text-white font-semibold">{stats.conversionRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Usuários Ativos</span>
              <span className="text-white font-semibold">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Patrocinadores</span>
              <span className="text-white font-semibold">{stats.totalPatrocinadores}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Tendências</h3>
          <div className="h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
            <p className="text-gray-400">Gráfico de tendências em desenvolvimento</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Campanhas Tab
function CampanhasTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Campanhas</h2>
        <p className="text-orange-100">Gerencie campanhas de marketing</p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Nova Campanha</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome da Campanha</label>
            <input
              type="text"
              placeholder="Ex: Campanha de Inscrições"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
            <textarea
              placeholder="Descreva a campanha..."
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data de Início</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data de Fim</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-white"
              />
            </div>
          </div>
          <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
            🎯 Criar Campanha
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Campanhas Ativas</h3>
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-lg font-medium mb-2">Nenhuma Campanha Ativa</p>
          <p className="text-sm">Crie sua primeira campanha de marketing</p>
        </div>
      </div>
    </div>
  );
}
