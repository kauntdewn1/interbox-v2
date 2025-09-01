import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TIPOS_CADASTRO = [
  {
    id: 'atleta',
    titulo: 'Atleta',
    descricao: 'Quero competir no Interbox 2025',
    icon: '🏃',
    accentColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    id: 'judge',
    titulo: 'Judge',
    descricao: 'Quero ser judge do evento',
    icon: '⚖️',
    accentColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    id: 'midia',
    titulo: 'Mídia',
    descricao: 'Quero cobrir o evento',
    icon: '📸',
    accentColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'espectador',
    titulo: 'Torcida',
    descricao: 'Acompanhe as competições e participe da comunidade',
    icon: '👥',
    accentColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  {
    id: 'publico',
    titulo: 'Público Geral',
    descricao: 'Outro tipo de participação',
    icon: '🎫',
    accentColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
];

interface FormData {
  nome: string;
  email: string;
  whatsapp: string;
  box: string;
  cidade: string;
  mensagem: string;
}

export default function SelecaoTipoCadastro() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    nome: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    whatsapp: '',
    box: '',
    cidade: '',
    mensagem: '',
  });

  // 🎯 ATUALIZAR EMAIL AUTOMATICAMENTE QUANDO USER MUDAR
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      setFormData(prev => ({
        ...prev,
        email: user.primaryEmailAddress.emailAddress,
        nome: user.fullName || prev.nome
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
      // 🎯 INSERIR NO SUPABASE
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: formData.email,
          display_name: formData.nome,
          role: selectedType,
          whatsapp: formData.whatsapp,
          box: formData.box,
          cidade: formData.cidade,
          mensagem: formData.mensagem,
          profile_complete: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          gamification: {
            level: 'cindy',
            tokens: {
              box: {
                balance: 10,
                total_earned: 10,
                total_spent: 0,
                last_transaction: new Date().toISOString(),
              },
            },
            total_actions: 1,
            last_action_at: new Date().toISOString(),
            achievements: ['primeiro_cadastro'],
            rewards: [],
            frequencia_dias: 1,
            ultimo_login_frequencia: new Date().toISOString(),
            referral_code: `REF${user.id.slice(-6).toUpperCase()}`,
            referrals: [],
            referral_tokens: 0,
            weekly_tokens: 10,
            monthly_tokens: 10,
            yearly_tokens: 10,
            melhor_frequencia: 1,
            badges: ['primeiro_cadastro'],
            challenges: [],
          },
        });

      if (insertError) {
        throw new Error('Erro ao salvar dados');
      }

      // 🎯 ATUALIZAR METADADOS DO CLERK
      await user.update({
        publicMetadata: {
          role: selectedType,
          profileComplete: true,
        },
      });

      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.6 },
        colors: ['#007AFF', '#34C759', '#FF9500'],
      });

      setTimeout(async () => {
        alert(`🎉 Cadastro realizado com sucesso! 
        
🏆 Primeira Conquista: +10 ₿ØX
🎯 Nível: Iniciante
📈 Frequência: 1 dia

Bem-vindo ao Interbox 2025! 🚀`);
        
        // Redirecionar para o perfil correto baseado no tipo selecionado
        switch (selectedType) {
          case 'atleta':
            navigate('/perfil/atleta');
            break;
          case 'judge':
            navigate('/perfil/judge');
            break;
          case 'midia':
            navigate('/perfil/midia');
            break;
          case 'espectador':
            navigate('/perfil/espectador');
            break;
          case 'publico':
            navigate('/perfil/espectador');
            break;
          default:
            navigate('/perfil');
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
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0]">
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
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">🎯</span>
                </div>
                <h1 className="text-xl font-bold text-white mb-2">
                  Escolha seu perfil
                </h1>
                <p className="text-gray-300 text-xs leading-relaxed">
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
                      cursor-pointer transition-all duration-200 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10
                      hover:bg-white/10 hover:border-white/20 active:scale-95
                    `}
                    onClick={() => handleTypeSelect(tipo.id)}
                  >
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{tipo.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm">
                            {tipo.titulo}
                          </h3>
                          <p className="text-gray-400 text-xs leading-tight">
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
                  className="inline-flex items-center text-pink-400 hover:text-pink-300 transition-colors mb-3 text-xs"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Voltar
                </button>
                
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <span className="text-lg text-white font-bold">{selectedTipo?.icon}</span>
                </div>
                
                <h1 className="text-lg font-bold text-white mb-2">
                  {selectedTipo?.titulo}
                </h1>
                <p className="text-gray-300 text-xs leading-relaxed">
                  Complete seus dados para finalizar o cadastro
                </p>
                
                {/* 🎯 INDICAÇÃO DE EMAIL PREENCHIDO */}
                {user?.primaryEmailAddress?.emailAddress && (
                  <div className="mt-3 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-xs text-green-300">
                      ✅ Email: <strong>{user.primaryEmailAddress.emailAddress}</strong> (preenchido automaticamente)
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-3">
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="nome" className="block text-xs font-medium text-white mb-1">
                          Nome Completo
                        </label>
                        <input
                          id="nome"
                          type="text"
                          name="nome"
                          value={formData.nome}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-white text-sm placeholder-gray-400"
                          placeholder="Seu nome completo"
                        />
                      </div>

                      {/* 🎯 EMAIL INVISÍVEL - Usuário já está logado */}
                      <input
                        type="hidden"
                        name="email"
                        value={user?.primaryEmailAddress?.emailAddress || ''}
                      />

                      <div>
                        <label htmlFor="whatsapp" className="block text-xs font-medium text-white mb-1">
                          WhatsApp
                        </label>
                        <input
                          id="whatsapp"
                          type="tel"
                          name="whatsapp"
                          value={formData.whatsapp}
                          onChange={handleChange}
                          placeholder="(11) 99999-9999"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-white text-sm placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <label htmlFor="box" className="block text-xs font-medium text-white mb-1">
                          Box/Academia
                        </label>
                        <input
                          id="box"
                          type="text"
                          name="box"
                          value={formData.box}
                          onChange={handleChange}
                          placeholder="Nome da sua academia"
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-white text-sm placeholder-gray-400"
                        />
                      </div>

                      <div>
                        <label htmlFor="cidade" className="block text-xs font-medium text-white mb-1">
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
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-white text-sm placeholder-gray-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="mensagem" className="block text-xs font-medium text-white mb-1">
                        Mensagem/Motivação
                      </label>
                      <textarea
                        id="mensagem"
                        name="mensagem"
                        value={formData.mensagem}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors text-white resize-none text-sm placeholder-gray-400"
                        placeholder="Conte um pouco sobre sua motivação para participar do evento..."
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 text-sm shadow-sm"
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
