import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { supabase } from '../lib/supabase';



interface PatrocinadorFormData {
  nome: string;
  empresa: string;
  categoria: string;
  telefone: string;
  email: string;
  promessa: string;
  observacoes: string;
  logomarca: File | null;
}

const CATEGORIAS = [
  'Patrocinador',
  'Apoiador',
  'Parceiro'
];

export default function PatrocinadoresPage() {
  const [formData, setFormData] = useState<PatrocinadorFormData>({
    nome: '',
    empresa: '',
    categoria: 'Patrocinador',
    telefone: '',
    email: '',
    promessa: '',
    observacoes: '',
    logomarca: null
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.nome.trim()) errors.push('Nome é obrigatório');
    if (!formData.empresa.trim()) errors.push('Empresa é obrigatória');
    if (!formData.telefone.trim()) errors.push('Telefone é obrigatório');
    if (!formData.email.trim()) errors.push('Email é obrigatório');
    if (!formData.email.includes('@')) errors.push('Email inválido');
    if (!formData.promessa.trim()) errors.push('Observações importantes são obrigatórias');
    if (!formData.logomarca) errors.push('Logomarca é obrigatória');

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const errors = validateForm();
    if (errors.length > 0) {
      setError(`Por favor, corrija os seguintes erros: ${errors.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      let logomarcaUrl = '';
      
      // Upload da logomarca se existir
      if (formData.logomarca) {
        const fileName = `${Date.now()}_${formData.logomarca.name}`;
        
        // Tentar fazer upload para o bucket logomarcas
        const { error: uploadError } = await supabase.storage
          .from('logomarcas')
          .upload(fileName, formData.logomarca);

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          // Se o bucket não existir, vamos salvar sem a imagem por enquanto
          console.warn('Bucket logomarcas não encontrado, salvando sem imagem');
        } else {
          // Obter URL pública
          const { data: urlData } = supabase.storage
            .from('logomarcas')
            .getPublicUrl(fileName);

          logomarcaUrl = urlData.publicUrl;
        }
      }

      // Salvar no Supabase
      const { error: insertError } = await supabase
        .from('patrocinadores')
        .insert({
          nome: formData.nome,
          empresa: formData.empresa,
          categoria: formData.categoria,
          telefone: formData.telefone,
          email: formData.email,
          promessa: formData.promessa,
          observacoes: formData.observacoes,
          logomarca_url: logomarcaUrl,
          status: 'novo',
          created_at: new Date().toISOString()
        });

      if (insertError) {
        throw new Error('Erro ao salvar dados');
      }

      setSuccess(true);
      setFormData({
        nome: '',
        empresa: '',
        categoria: 'Patrocinador',
        telefone: '',
        email: '',
        promessa: '',
        observacoes: '',
        logomarca: null
      });

      // Reset do input de arquivo
      const fileInput = document.getElementById('logomarca') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setError('Erro ao enviar formulário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      logomarca: file
    }));
  };

  if (success) {
    return (
      <>
        <SEOHead 
          title="Interesse Registrado - INTERBØX 2025"
          description="Seu interesse em participar do INTERBØX 2025 foi registrado com sucesso. Entraremos em contato em breve."
        />
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto text-center p-8"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-6xl mb-6">✅</div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Interesse Registrado!
              </h1>
              <p className="text-gray-300 mb-6">
                Seu interesse em participar do INTERBØX 2025 foi registrado com sucesso. 
                Nossa equipe entrará em contato em breve para discutir as possibilidades de parceria.
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Voltar ao Início
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="Seja um Parceiro - INTERBØX 2025"
        description="Interessado em participar do INTERBØX 2025? Registre seu interesse e nossa equipe entrará em contato."
      />
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Seja um Parceiro do <span className="text-pink-500">INTERBØX 2025</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Registre seu interesse em participar do maior evento Fitness de times da América Latina. 
              Nossa equipe entrará em contato para discutir as possibilidades de parceria.
            </p>
          </motion.div>

          {/* Formulário */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Nome */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Nome do Responsável *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Nome da sua empresa"
                  required
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Tipo de Participação *
                </label>
                <div className="space-y-2">
                  {CATEGORIAS.map((categoria) => (
                    <label key={categoria} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="categoria"
                        value={categoria}
                        checked={formData.categoria === categoria}
                        onChange={handleChange}
                        className="text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-white">{categoria}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-white font-semibold mb-2">
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {/* Logomarca */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Logomarca/Documento da Empresa *
                </label>
                <input
                  type="file"
                  id="logomarca"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
                <p className="text-gray-400 text-sm mt-1">
                  Aceita imagens (JPG, PNG, WEBP) e documentos (PDF)
                </p>
              </div>

              {/* Observações Importantes */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Observações Importantes *
                </label>
                <textarea
                  name="promessa"
                  value={formData.promessa}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Descreva seu interesse, proposta ou observações importantes sobre a participação..."
                  required
                />
              </div>

              {/* Observações Adicionais */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Observações Adicionais
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Informações adicionais que gostaria de compartilhar..."
                />
              </div>

              {/* Botão Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Registrar Interesse'}
                </button>
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-lg p-4"
                >
                  <p className="text-red-300">{error}</p>
                </motion.div>
              )}

            </form>
          </motion.div>

          {/* Informações Adicionais */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400 text-sm">
              * Campos obrigatórios. Após o envio, nossa equipe entrará em contato em até 48 horas.
            </p>
          </motion.div>

        </div>
      </div>
      
      <Footer />
    </>
  );
}
