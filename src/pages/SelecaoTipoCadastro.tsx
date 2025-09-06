// Refatoração total aplicada. Lógica de criação de usuário com Supabase, Clerk e redirecionamento por tipo.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';
import Header from '../components/Header';
import Footer from '../components/Footer';


const TIPOS_CADASTRO = [
  { id: 'atleta', titulo: 'Atleta', descricao: 'Quero competir no Interbox 2025', icon: '⧉', accentColor: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  { id: 'judge', titulo: 'Judge', descricao: 'Quero ser judge do evento', icon: '⧖', accentColor: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  { id: 'midia', titulo: 'Mídia', descricao: 'Quero cobrir o evento', icon: '⍟', accentColor: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  { id: 'espectador', titulo: 'Torcida', descricao: 'Acompanhe as competições e participe da comunidade', icon: '⟠ ', accentColor: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
  { id: 'publico', titulo: 'Público Geral', descricao: 'Outro tipo de participação', icon: '⧇', accentColor: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
]; 

export default function SelecaoTipoCadastro() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handleTypeSelect = async (tipoId: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Salvar o role no Clerk
      await user.update({
        unsafeMetadata: {
          role: tipoId,
          profileComplete: false, // Ainda não está completo
        },
      });

      // Confetti removido - será exibido apenas no final do cadastro

      setTimeout(() => {
        // Redirecionar para setup para completar o perfil
        navigate('/setup');
      }, 1000);

    } catch (err) {
      console.error('Erro ao salvar tipo de cadastro:', err);
      alert('Erro ao salvar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0]">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Escolha seu tipo de participação
          </h1>
          <p className="text-gray-300 text-lg">
            Como você quer participar do INTERBØX 2025?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TIPOS_CADASTRO.map((tipo) => (
            <button
              key={tipo.id}
              onClick={() => handleTypeSelect(tipo.id)}
              disabled={loading}
              className={`
                p-6 rounded-xl border-2 transition-all duration-200
                hover:scale-105 hover:shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed
                ${tipo.bgColor} ${tipo.borderColor}
                hover:border-opacity-60
              `}
            >
              <div className="text-center">
                <div className="text-4xl mb-3">{tipo.icon}</div>
                <h3 className={`text-xl font-bold mb-2 ${tipo.accentColor}`}>
                  {tipo.titulo}
                </h3>
                <p className="text-gray-600 text-sm">
                  {tipo.descricao}
                </p>
              </div>
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center space-x-2 text-white">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
              <span>Processando...</span>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
