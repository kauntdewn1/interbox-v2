import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import imageCompression from 'browser-image-compression';
import Header from '../components/Header'
import Footer from '../components/Footer';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import { useTokenActions } from '../hooks/useTokenActions';

// Tipos
interface FormData {
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  box: string;
  categoria: 'publico' | 'atleta' | 'judge' | 'staff' | 'midia' | 'espectador' | 'patrocinador' | 'apoio';
  cidade: string;
  mensagem: string;
}

// Interface que corresponde ao schema do Supabase
interface UserInsertData {
  id?: string;
  clerk_id: string;
  email: string;
  display_name?: string | null;
  photo_url?: string | null;
  role: string;
  box?: string | null;
  cidade?: string | null;
  profile_complete?: boolean;
}

// Interface para dados de gamificação
interface UserGamificationData {
  user_id: string;
  box_tokens?: number;
  total_earned?: number;
  achievements?: string[];
  last_action?: string | null;
}

// Constantes
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const BASE_TOKENS = 50;
const PHOTO_BONUS_TOKENS = 10;

// Avatares disponíveis (apenas os básicos por enquanto)
const AVATAR_OPTIONS = [
  { id: 'default', name: 'Padrão', image: '/images/default-avatar.png', cost: 0 },
  { id: 'atleta', name: 'Atleta', image: '/images/atleta-avatar.png', cost: 0 },
  { id: 'judge', name: 'Judge', image: '/images/avatar/judge-avatar.png', cost: 0 },
  { id: 'staff', name: 'Staff', image: '/images/avatar/staff-avatar.png', cost: 0 },
];


const CATEGORIA_OPTIONS = [
  { value: 'publico', label: 'Público Geral' },
  { value: 'atleta', label: 'Atleta' },
  { value: 'judge', label: 'Judge' },
  { value: 'staff', label: 'Staff' },
  { value: 'midia', label: 'Mídia' },
  { value: 'espectador', label: 'Torcida' },
  { value: 'patrocinador', label: 'Patrocinador' },
  { value: 'apoio', label: 'Apoio' },
] as const;

// Componente principal
export default function SetupProfile() {
  const { user } = useUser();
  const { awardTokens } = useTokenActions();
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState('default');
  const [formData, setFormData] = useState<FormData>({
    nome: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    telefone: '',
    whatsapp: '',
    box: '',
    categoria: (user?.unsafeMetadata?.role as any) || 'publico',
    cidade: '',
    mensagem: '',
  });

  // Efeito de confetti na montagem do componente
  React.useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  // Handlers
  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePhotoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tamanho
    if (file.size > MAX_FILE_SIZE) {
      alert('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    try {
      // Compressão da imagem
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      });

      setPhotoFile(compressedFile);

      // Preview da imagem
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Erro ao comprimir imagem:', error);
      alert('Erro ao processar a imagem. Tente novamente.');
    }
  }, []);

  const uploadPhoto = async (userId: string): Promise<string | null> => {
    if (!photoFile) return null;

    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${userId}/profile-photo.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, photoFile, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  };

  const saveUserProfile = async (userData: UserInsertData) => {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userData.clerk_id)
      .single();

    if (existingUser) {
      // Atualizar usuário existente
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('clerk_id', userData.clerk_id);
      
      if (error) throw error;
    } else {
      // Criar novo usuário
      const { error } = await supabase
        .from('users')
        .insert(userData);
      
      if (error) throw error;
    }
  };

  const saveUserGamification = async (gamificationData: UserGamificationData) => {
    const { data: existingGamification } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', gamificationData.user_id)
      .single();

    if (existingGamification) {
      // Atualizar dados de gamificação existentes
      const { error } = await supabase
        .from('user_gamification')
        .update({
          box_tokens: (existingGamification.box_tokens || 0) + (gamificationData.box_tokens || 0),
          total_earned: (existingGamification.total_earned || 0) + (gamificationData.total_earned || 0),
          achievements: [...(existingGamification.achievements || []), ...(gamificationData.achievements || [])],
          last_action: gamificationData.last_action,
        })
        .eq('user_id', gamificationData.user_id);
      
      if (error) throw error;
    } else {
      // Criar novos dados de gamificação
      const { error } = await supabase
        .from('user_gamification')
        .insert(gamificationData);
      
      if (error) throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Usuário não autenticado');
      return;
    }

    setLoading(true);
    
    try {
      // Upload da foto (se existir) ou usar avatar selecionado
      let photoURL = null;
      if (photoFile) {
        photoURL = await uploadPhoto(user.id);
      } else {
        // Usar avatar selecionado
        const selectedAvatarData = AVATAR_OPTIONS.find(avatar => avatar.id === selectedAvatar);
        photoURL = selectedAvatarData?.image || '/images/default-avatar.png';
      }
      
      // Conceder tokens usando o novo sistema
      await awardTokens('completar_perfil');
      
      if (photoFile) {
        await awardTokens('completar_perfil', PHOTO_BONUS_TOKENS, 'Foto de perfil adicionada');
      }

      // Dados do usuário para a tabela users
      const userData: UserInsertData = {
        clerk_id: user.id,
        email: formData.email,
        display_name: formData.nome,
        photo_url: photoURL,
        role: formData.categoria,
        box: formData.box || null,
        cidade: formData.cidade,
        profile_complete: true,
      };

      // Salvar perfil no banco
      await saveUserProfile(userData);

      // Feedback de sucesso
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Atualizar metadata do Clerk
      await user.update({
        unsafeMetadata: {
          role: formData.categoria,
          profileComplete: true,
        },
      });

      alert(`✅ Perfil configurado com sucesso! Você ganhou tokens $BØX!`);
      
      // Redirecionamento baseado no role
      const role = formData.categoria === 'publico' ? 'espectador' : formData.categoria;
      window.location.href = `/perfil/${role}`;
      
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao configurar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Deseja cancelar a configuração do perfil?')) {
      window.history.back();
    }
  };

  // Render
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      {/* Background com imagem */}
      <div
        className="flex-1 relative"
        style={{
          backgroundImage: 'url(/images/bg_main.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />

        {/* Conteúdo principal */}
        <div className="relative z-10 flex-1 flex items-center justify-center py-20 px-4">
          <div className="max-w-2xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20"
            >
              {/* Cabeçalho */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  ⚙️ Configurar Perfil
                </h1>
                <p className="text-gray-600">
                  Complete seu perfil para acessar o Interbox 2025
                </p>
                
                {/* Box de recompensas */}
                <div className="mt-4 p-4 bg-gradient-to-r from-pink-100 to-blue-100 rounded-lg border border-pink-200">
                  <p className="text-sm text-gray-700">
                    🎁 <strong>Ganhe tokens $BØX:</strong><br/>
                    +25 $BØX por completar o perfil<br/>
                    +10 $BØX por adicionar foto
                  </p>
                </div>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Upload de Foto */}
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    📸 Foto de Perfil (Opcional)
                  </label>
                  
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mx-auto border-4 border-gray-300 shadow-lg">
                      {photoPreview ? (
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <label className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="sr-only"
                      />
                      {photoFile ? '📸 Foto selecionada' : '📷 Adicionar foto'}
                    </label>
                  </div>

                  {photoFile && (
                    <p className="mt-2 text-sm" style={{ color: 'rgb(251, 5, 228)' }}>
                      ✅ +{PHOTO_BONUS_TOKENS} $BØX garantidos pela foto!
                    </p>
                  )}
                </div>

                {/* Seleção de Avatar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    🎭 Ou escolha um avatar
                  </label>
                  
                  <div className="grid grid-cols-5 gap-3">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(avatar.id);
                          setPhotoFile(null);
                          setPhotoPreview(null);
                        }}
                        className={`
                          relative p-2 rounded-lg border-2 transition-all duration-200
                          ${selectedAvatar === avatar.id 
                            ? 'border-pink-500 bg-pink-50' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <img
                          src={avatar.image}
                          alt={avatar.name}
                          className="w-12 h-12 rounded-full object-cover mx-auto"
                        />
                        <div className="mt-1 text-xs text-center">
                          <div className="font-medium text-gray-700">{avatar.name}</div>
                        </div>
                        {selectedAvatar === avatar.id && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600">
                    💡 Escolha seu avatar inicial. Mais opções serão adicionadas em breve!
                  </p>
                </div>

                {/* Campos do formulário */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      id="nome"
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      autoComplete="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      id="telefone"
                      type="tel"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp
                    </label>
                    <input
                      id="whatsapp"
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="box" className="block text-sm font-medium text-gray-700 mb-2">
                      Box/Academia
                    </label>
                    <input
                      id="box"
                      type="text"
                      name="box"
                      value={formData.box}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade *
                    </label>
                    <input
                      id="cidade"
                      type="text"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  >
                    {CATEGORIA_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem/Motivação
                  </label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                    placeholder="Conte um pouco sobre sua motivação para participar do evento..."
                  />
                </div>

                {/* Botões de ação */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-pink-600 to-blue-600 text-white rounded-md hover:from-pink-700 hover:to-blue-700 disabled:bg-gray-400 transition-all duration-300 font-medium"
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}