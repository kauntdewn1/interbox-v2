import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

// ============================================================================
// INTERFACES
// ============================================================================

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }>;
}

interface DashboardChartsProps {
  users: Array<{
    id: string;
    role?: string;
    box?: string;
    status?: string;
  }>;
  teams: Array<{
    id: string;
    categoria?: string;
    status?: string;
    createdAt?: Date | string;
  }>;
  parceiros: Array<{
    id: string;
    tipo?: 'Patrocinador' | 'Apoiador';
    categoria?: string;
    status?: string;
    cota?: { valor?: number };
    beneficio?: { valorEstimado?: number };
  }>;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const DashboardCharts: React.FC<DashboardChartsProps> = ({ users, teams, parceiros }) => {
  
  // ============================================================================
  // DADOS PARA GRÁFICOS
  // ============================================================================
  
  // Gráfico de distribuição de usuários por Box
  const usersByBoxData: ChartData = {
    labels: Array.from(new Set(users.map(u => u.box).filter(box => box && box !== 'N/A' && box !== undefined))) as string[],
    datasets: [{
      label: 'Usuários por Box',
      data: Array.from(new Set(users.map(u => u.box).filter(box => box && box !== 'N/A' && box !== undefined)))
        .map(box => users.filter(u => u.box === box).length),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
      ],
      borderWidth: 2,
    }]
  };

  // Gráfico de distribuição de usuários por Role/Tipo
  const usersByRoleData: ChartData = {
    labels: Array.from(new Set(users.map(u => u.role).filter(role => role && role !== undefined))) as string[],
    datasets: [{
      label: 'Usuários por Tipo',
      data: Array.from(new Set(users.map(u => u.role).filter(role => role && role !== undefined)))
        .map(role => users.filter(u => u.role === role).length),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
      ],
      borderWidth: 2,
    }]
  };

  // Gráfico de distribuição de times por categoria
  const teamsByCategoryData: ChartData = {
    labels: Array.from(new Set(teams.map(t => t.categoria).filter(cat => cat && cat !== undefined))) as string[],
    datasets: [{
      label: 'Times por Categoria',
      data: Array.from(new Set(teams.map(t => t.categoria).filter(cat => cat && cat !== undefined)))
        .map(cat => teams.filter(t => t.categoria === cat).length),
      backgroundColor: 'rgba(54, 162, 235, 0.8)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2,
    }]
  };

  // Gráfico de status dos times
  const teamsByStatusData: ChartData = {
    labels: Array.from(new Set(teams.map(t => t.status).filter(status => status && status !== undefined))) as string[],
    datasets: [{
      label: 'Times por Status',
      data: Array.from(new Set(teams.map(t => t.status).filter(status => status && status !== undefined)))
        .map(status => teams.filter(t => t.status === status).length),
      backgroundColor: [
        '#4BC0C0', '#FF6384', '#FFCE56', '#36A2EB', '#9966FF'
      ],
      borderWidth: 2,
    }]
  };

  // Gráfico de distribuição de parceiros
  const parceirosByTypeData: ChartData = {
    labels: ['Patrocinadores', 'Apoiadores'],
    datasets: [{
      label: 'Parceiros por Tipo',
      data: [
        parceiros.filter(p => p.tipo === 'Patrocinador').length,
        parceiros.filter(p => p.tipo === 'Apoiador').length
      ],
      backgroundColor: ['#FF6384', '#36A2EB'],
      borderWidth: 2,
    }]
  };

  // Gráfico de valor por categoria de parceiros
  const parceirosByCategoryData: ChartData = {
    labels: Array.from(new Set(parceiros.map(p => p.categoria).filter(cat => cat && cat !== undefined))) as string[],
    datasets: [{
      label: 'Valor por Categoria (R$)',
      data: Array.from(new Set(parceiros.map(p => p.categoria).filter(cat => cat && cat !== undefined)))
        .map(cat => {
          const catParceiros = parceiros.filter(p => p.categoria === cat);
          return catParceiros.reduce((sum, p) => {
            if (p.tipo === 'Patrocinador' && p.cota?.valor) {
              return sum + (p.cota.valor || 0);
            } else if (p.tipo === 'Apoiador' && p.beneficio?.valorEstimado) {
              return sum + (p.beneficio.valorEstimado || 0);
            }
            return sum;
          }, 0);
        }),
      backgroundColor: 'rgba(255, 99, 132, 0.8)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
    }]
  };

  // ============================================================================
  // OPÇÕES DOS GRÁFICOS
  // ============================================================================
  
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Distribuição',
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Análise por Categoria',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="space-y-8">
      {/* Título da Seção */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Análises Visuais</h2>
        <p className="text-gray-600">Gráficos e estatísticas para melhor compreensão dos dados</p>
      </div>

      {/* Gráficos de Usuários */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 Usuários por Box</h3>
          <div className="h-64">
            <Pie data={usersByBoxData} options={pieChartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Usuários por Tipo</h3>
          <div className="h-64">
            <Pie data={usersByRoleData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      {/* Gráficos de Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Times por Categoria</h3>
          <div className="h-64">
            <Bar data={teamsByCategoryData} options={barChartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Status dos Times</h3>
          <div className="h-64">
            <Pie data={teamsByStatusData} options={pieChartOptions} />
          </div>
        </div>
      </div>

      {/* Gráficos de Parceiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🤝 Parceiros por Tipo</h3>
          <div className="h-64">
            <Pie data={parceirosByTypeData} options={pieChartOptions} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Valor por Categoria</h3>
          <div className="h-64">
            <Bar data={parceirosByCategoryData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Resumo Estatístico */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Resumo Geral</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total Usuários</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{teams.length}</div>
            <div className="text-sm text-gray-600">Total Times</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{parceiros.length}</div>
            <div className="text-sm text-gray-600">Total Parceiros</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {Array.from(new Set(users.map(u => u.box).filter(box => box && box !== 'N/A' && box !== undefined))).length}
            </div>
            <div className="text-sm text-gray-600">Boxes Ativos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
