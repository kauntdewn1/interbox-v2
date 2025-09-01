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
    email: user?.primaryEmailAddress?.emailAddress ?? '',
    whatsapp: '',
    box: '',
    cidade: '',
    mensagem: '',
  });

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress ?? '') {
      setFormData(prev => ({
        ...prev,
        email: user?.primaryEmailAddress?.emailAddress ?? '',
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
      const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        clerk_id: user.id,
        email: formData.email,
        display_name: formData.nome,
        photo_url: user.imageUrl,
        role: selectedType,
        whatsapp: formData.whatsapp,
        box: formData.box,
        cidade: formData.cidade,
        mensagem: formData.mensagem,
        profile_complete: true,
        is_active: true,
        test_user: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      if (selectedType === 'atleta') {
        await supabase.from('competition_teams').insert({
          atleta_id: user.id,
          nome: `Time de ${formData.nome}`,
          criado_em: new Date().toISOString(),
        });
      }

      // Atualizar metadata do Clerk
      await user.update({
        unsafeMetadata: {
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

      setTimeout(() => {
        alert(`🎉 Cadastro realizado com sucesso!\n\n🏆 Primeira Conquista: +10 ₿ØX\n🎯 Nível: Iniciante\n📈 Frequência: 1 dia\n\nBem-vindo ao Interbox 2025! 🚀`);

        navigate(`/perfil/${selectedType === 'publico' ? 'espectador' : selectedType}`);
      }, 1000);

    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      alert('Erro ao salvar dados no Supabase.');
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
        {/* ...continua igual até o final */}
      </div>
      <Footer />
    </div>
  )
}
