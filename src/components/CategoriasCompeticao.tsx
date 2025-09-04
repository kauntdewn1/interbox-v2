// ============================================================================
// CATEGORIAS COMPETIÇÃO - INTERBØX V2
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useClerkSupabase } from '../hooks/useClerkSupabase';
import type { User } from '../types/supabase';

// ============================================================================
// TIPOS
// ============================================================================

interface CategoriasCompeticaoProps {
  className?: string;
  onCategoriaSelect?: (categoria: string) => void;
  selectedCategoria?: string;
  showStats?: boolean;
}

interface Categoria {
  id: string;
  nome: string;
  descricao: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  prioridade: number;
  requisitos: string[];
  inscricoes: number;
  maxInscricoes: number;
  ativo: boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const CATEGORIAS_PADRAO: Categoria[] = [
  {
    id: 'scale',
    nome: 'Scale',
    descricao: 'Para atletas que estão começando no CrossFit',
    icon: '🌱',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    prioridade: 1,
    requisitos: ['CrossFit básico', 'Movimentos fundamentais'],
    inscricoes: 0,
    maxInscricoes: 100,
    ativo: true
  },
  {
    id: 'rx',
    nome: 'RX',
    descricao: 'Para atletas intermediários com boa técnica',
    icon: '💪',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    prioridade: 2,
    requisitos: ['Técnica avançada', 'Movimentos complexos'],
    inscricoes: 0,
    maxInscricoes: 80,
    ativo: true
  },
  {
    id: 'elite',
    nome: 'Elite',
    descricao: 'Para atletas de alto nível competitivo',
    icon: '🏆',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    prioridade: 3,
    requisitos: ['Nível competitivo', 'Experiência avançada'],
    inscricoes: 0,
    maxInscricoes: 50,
    ativo: true
  },
  {
    id: 'iniciante',
    nome: 'Iniciante',
    descricao: 'Para quem está começando no CrossFit',
    icon: '🎯',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    prioridade: 4,
    requisitos: ['Primeiros passos', 'Aprendizado básico'],
    inscricoes: 0,
    maxInscricoes: 120,
    ativo: true
  },
  {
    id: 'master',
    nome: 'Master',
    descricao: 'Para atletas veteranos (40+ anos)',
    icon: '👑',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    prioridade: 5,
    requisitos: ['40+ anos', 'Experiência comprovada'],
    inscricoes: 0,
    maxInscricoes: 60,
    ativo: true
  }
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CategoriasCompeticao({ 
  className = '',
  onCategoriaSelect,
  selectedCategoria,
  showStats = true
}: CategoriasCompeticaoProps) {
  const { user } = useClerkSupabase();
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_PADRAO);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    fetchCategorias();
  }, []);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar inscrições por categoria do Supabase
      const { data: inscricoes, error } = await supabase
        .from('users')
        .select('role, created_at')
        .eq('role', 'atleta')
        .eq('is_active', true);

      if (error) throw error;

      // Atualizar contadores de inscrições
      const categoriasAtualizadas = CATEGORIAS_PADRAO.map(categoria => ({
        ...categoria,
        inscricoes: Math.floor(Math.random() * categoria.maxInscricoes) // Simular dados
      }));

      // Ordenar por prioridade (Scale, RX, Elite, Iniciante, Master)
      const categoriasOrdenadas = categoriasAtualizadas.sort((a, b) => a.prioridade - b.prioridade);

      setCategorias(categoriasOrdenadas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
      console.error('Erro ao buscar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriaClick = (categoria: Categoria) => {
    if (onCategoriaSelect) {
      onCategoriaSelect(categoria.id);
    }
  };

  const getDisponibilidade = (categoria: Categoria): { status: string; color: string } => {
    const percentual = (categoria.inscricoes / categoria.maxInscricoes) * 100;
    
    if (percentual >= 100) return { status: 'Esgotado', color: 'text-red-500' };
    if (percentual >= 80) return { status: 'Quase esgotado', color: 'text-orange-500' };
    if (percentual >= 50) return { status: 'Disponível', color: 'text-yellow-500' };
    return { status: 'Muitas vagas', color: 'text-green-500' };
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-32 bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-4xl mb-4">😞</div>
        <h3 className="text-lg font-semibold text-white mb-2">Erro ao carregar categorias</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={fetchCategorias}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Categorias de Competição</h2>
        <p className="text-gray-400">
          Escolha a categoria que melhor se adequa ao seu nível
        </p>
      </div>

      {/* Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {categorias.map((categoria, index) => {
            const disponibilidade = getDisponibilidade(categoria);
            const isSelected = selectedCategoria === categoria.id;
            const isDisabled = !categoria.ativo || categoria.inscricoes >= categoria.maxInscricoes;

            return (
              <motion.div
                key={categoria.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => !isDisabled && handleCategoriaClick(categoria)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-pink-500 bg-pink-500/10 ring-2 ring-pink-500/20'
                    : isDisabled
                    ? 'border-gray-600 bg-gray-800/50 opacity-50 cursor-not-allowed'
                    : 'border-gray-700 bg-gray-800 hover:border-pink-300 hover:bg-gray-700 cursor-pointer'
                }`}
              >
                {/* Ícone e Nome */}
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{categoria.icon}</div>
                  <h3 className={`text-xl font-bold ${categoria.color}`}>
                    {categoria.nome}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {categoria.descricao}
                  </p>
                </div>

                {/* Requisitos */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Requisitos:</h4>
                  <ul className="space-y-1">
                    {categoria.requisitos.map((requisito, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-300">
                        <span className="text-green-400 mr-2">✓</span>
                        {requisito}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Estatísticas */}
                {showStats && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Inscrições:</span>
                      <span className="text-white">
                        {categoria.inscricoes}/{categoria.maxInscricoes}
                      </span>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                        style={{
                          width: `${Math.min(100, (categoria.inscricoes / categoria.maxInscricoes) * 100)}%`
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Status:</span>
                      <span className={disponibilidade.color}>
                        {disponibilidade.status}
                      </span>
                    </div>
                  </div>
                )}

                {/* Badge de selecionado */}
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                      Selecionado
                    </div>
                  </div>
                )}

                {/* Badge de esgotado */}
                {isDisabled && (
                  <div className="absolute top-2 right-2">
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {categoria.inscricoes >= categoria.maxInscricoes ? 'Esgotado' : 'Inativo'}
                    </div>
                  </div>
                )}

                {/* Prioridade (para debug) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="absolute bottom-2 left-2">
                    <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded">
                      Prioridade: {categoria.prioridade}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer com informações */}
      <div className="text-center text-sm text-gray-400">
        <p>
          As categorias são ordenadas por prioridade: Scale → RX → Elite → Iniciante → Master
        </p>
        <p className="mt-1">
          Escolha a categoria que melhor se adequa ao seu nível de experiência
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// HOOK PARA USAR CATEGORIAS
// ============================================================================

export function useCategoriasCompeticao() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simular busca de dados (substituir por query real do Supabase)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const categoriasComDados = CATEGORIAS_PADRAO.map(categoria => ({
        ...categoria,
        inscricoes: Math.floor(Math.random() * categoria.maxInscricoes)
      }));

      setCategorias(categoriasComDados.sort((a, b) => a.prioridade - b.prioridade));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  return {
    categorias,
    loading,
    error,
    refetch: fetchCategorias
  };
}
