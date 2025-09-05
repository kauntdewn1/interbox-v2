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

interface Log {
  id: string;
  level: string;
  message: string;
  timestamp: string;
  user_id?: string;
}

const DEV_TABS = [
  { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
  { id: 'logs', label: '📝 Logs', icon: '📝' },
  { id: 'database', label: '🗄️ Database', icon: '🗄️' },
  { id: 'testing', label: '🧪 Testing', icon: '🧪' },
  { id: 'deployment', label: '🚀 Deployment', icon: '🚀' }
];

export default function Dev() {
  const { user } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estados dos dados
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLogs: 0,
    errors: 0,
    warnings: 0
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

  // Carregar dados de desenvolvimento
  const loadDevData = useCallback(async () => {
    try {
      // Carregar logs (simulado)
      const mockLogs: Log[] = [
        {
          id: '1',
          level: 'info',
          message: 'Sistema iniciado com sucesso',
          timestamp: new Date().toISOString(),
          user_id: user?.id
        },
        {
          id: '2',
          level: 'warning',
          message: 'Cache expirado, recarregando dados',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          user_id: user?.id
        },
        {
          id: '3',
          level: 'error',
          message: 'Falha na conexão com Supabase',
          timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          user_id: user?.id
        }
      ];
      
      setLogs(mockLogs);

      // Carregar estatísticas
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalLogs: mockLogs.length,
        errors: mockLogs.filter(log => log.level === 'error').length,
        warnings: mockLogs.filter(log => log.level === 'warning').length
      });

    } catch (error) {
      console.error('Erro ao carregar dados de desenvolvimento:', error);
    }
  }, [user]);

  // Effects
  useEffect(() => {
    if (user) {
      loadUserData(user.id);
      loadDevData();
      setLoading(false);
    }
  }, [user, loadUserData, loadDevData]);

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
  if (!userData || userData.role !== 'dev') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-300 mb-4">Esta página é exclusiva para desenvolvedores.</p>
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
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">💻</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Dev Dashboard</h1>
              <p className="text-gray-300">Ferramentas de desenvolvimento e monitoramento</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">Dev</div>
              <div className="text-white">{userData.display_name}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6">
          <div className="flex space-x-2 overflow-x-auto">
            {DEV_TABS.map((tab) => (
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
            logs={logs}
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
    totalLogs: number;
    errors: number;
    warnings: number;
  };
  logs: Log[];
}

function TabContent({ activeTab, stats, logs }: TabContentProps) {
  switch (activeTab) {
    case 'dashboard':
      return <DashboardTab stats={stats as DevStats | any} />;
    case 'logs':
      return <LogsTab logs={logs as Log[]} />;
    case 'database':
      return <DatabaseTab />;
    case 'testing':
      return <TestingTab />;
    case 'deployment':
      return <DeploymentTab />;
    default:
      return <DashboardTab stats={stats as DevStats | any} />;
  }
}

// Interface para estatísticas de desenvolvimento
interface DevStats {
  totalErrors: number;
  totalLogs: number;
  systemHealth: number;
  recentErrors: Array<{
    id: string;
    message: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
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
              <p className="text-3xl font-bold">{stats.totalUsers as number}</p>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Logs</p>
              <p className="text-3xl font-bold">{stats.totalLogs as number}</p>
            </div>
            <div className="text-3xl">📝</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Erros</p>
              <p className="text-3xl font-bold">{stats.errors as number}</p>
            </div>
            <div className="text-3xl">❌</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Warnings</p>
              <p className="text-3xl font-bold">{stats.warnings as number}</p>
            </div>
            <div className="text-3xl">⚠️</div>
          </div>
        </div>
      </div>

      {/* Status do Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Status do Sistema</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Supabase</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300">
                ✅ Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Clerk Auth</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300">
                ✅ Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">PWA Service Worker</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300">
                ✅ Ativo
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Tempo de Carregamento</span>
              <span className="text-white font-semibold">1.2s</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Memória Usada</span>
              <span className="text-white font-semibold">45MB</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Cache Hit Rate</span>
              <span className="text-white font-semibold">87%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            📝 Ver Logs
          </button>
          <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            🗄️ Database
          </button>
          <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            🧪 Testing
          </button>
          <button className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            🚀 Deploy
          </button>
        </div>
      </div>
    </div>
  );
}

// Logs Tab
function LogsTab({ logs }: { logs: Log[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Logs do Sistema</h2>
            <p className="text-indigo-100">Monitoramento de eventos e erros</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{logs.length}</p>
            <p className="text-indigo-100 text-sm">Total</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    log.level === 'error' ? 'bg-red-500/20 text-red-300' :
                    log.level === 'warning' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-gray-300 text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                {log.user_id && (
                  <span className="text-gray-400 text-sm">User: {log.user_id.slice(0, 8)}...</span>
                )}
              </div>
              <p className="text-white">{log.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Database Tab
function DatabaseTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Database</h2>
        <p className="text-green-100">Gerenciamento e monitoramento do banco de dados</p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Tabelas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/20 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-2">users</h4>
            <p className="text-green-200 text-sm">Tabela de usuários</p>
          </div>
          <div className="bg-blue-500/20 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-2">teams</h4>
            <p className="text-blue-200 text-sm">Tabela de times</p>
          </div>
          <div className="bg-purple-500/20 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-2">events</h4>
            <p className="text-purple-200 text-sm">Tabela de eventos</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Query Builder</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SQL Query</label>
            <textarea
              placeholder="SELECT * FROM users WHERE role = 'atleta'"
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 font-mono text-sm"
            />
          </div>
          <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            🔍 Executar Query
          </button>
        </div>
      </div>
    </div>
  );
}

// Testing Tab
function TestingTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Testing</h2>
        <p className="text-purple-100">Ferramentas de teste e validação</p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Testes Automatizados</h3>
        <div className="space-y-4">
          <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            🧪 Executar Testes Unitários
          </button>
          <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            🔄 Executar Testes de Integração
          </button>
          <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            🎯 Executar Testes E2E
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Validação de Dados</h3>
        <div className="text-center py-12 text-gray-400">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-lg font-medium mb-2">Validação de Schema</p>
          <p className="text-sm">Verificar integridade dos dados</p>
        </div>
      </div>
    </div>
  );
}

// Deployment Tab
function DeploymentTab() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Deployment</h2>
        <p className="text-yellow-100">Gerenciamento de deploy e versões</p>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Status do Deploy</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <span className="text-gray-300">Versão Atual</span>
            <span className="text-white font-semibold">v1.2.0</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <span className="text-gray-300">Último Deploy</span>
            <span className="text-white font-semibold">2 horas atrás</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-gray-300">Status</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-300">
              ✅ Online
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Ações de Deploy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            🚀 Deploy para Produção
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200">
            🔄 Rollback
          </button>
        </div>
      </div>
    </div>
  );
}
