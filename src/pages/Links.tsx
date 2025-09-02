import React from 'react';
import SEOHead from '../components/SEOHead';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface LinkItem {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  category: 'inscricoes' | 'apoiadores' | 'comunidade';
  color: string;
  external?: boolean;
  logo?: string;
  inactive?: boolean;
}

const LINKS: LinkItem[] = [
  // 🎟️ INSCRIÇÕES
  {
    id: 'atletas',
    title: 'Inscrição de Atletas',
    description: 'Garanta sua vaga na maior competição de times da América Latina',
    url: 'https://www.brasilgamesscoreboard.com.br/checkout/77e9f9d6-f194-4bc5-bc83-6311699c68a9',
    icon: '🏋️‍♂️',
    category: 'inscricoes',
    color: 'from-blue-500 to-cyan-600',
    external: true
  },
  {
    id: 'audiovisual',
    title: 'Candidatura Audiovisual',
    description: 'Seja fotógrafo, videomaker ou influencer oficial do INTERBØX 2025',
    url: 'https://interbox-captacao.netlify.app/audiovisual',
    icon: '📸',
    category: 'inscricoes',
    color: 'from-gray-600 to-gray-800',
    external: true
  },
  {
    id: 'judge-staff',
    title: 'Cadastro Judge & Staff',
    description: 'Seja parte da equipe oficial do INTERBØX 2025 como juiz ou staff',
    url: 'https://interbox-captacao.netlify.app/captacao/judge-staff',
    icon: '👨‍⚖️',
    category: 'inscricoes',
    color: 'from-orange-500 to-red-600',
    external: true
  },

  // 💪 APOIADORES
  {
    id: 'move',
    title: 'MOVE Recovery Esportivo',
    description: 'Reserve seu atendimento com a equipe MOVE durante o evento',
    url: 'https://mpago.la/2Q1u7fP',
    icon: '💪',
    category: 'apoiadores',
    color: 'from-purple-500 to-pink-600',
    external: true,
    logo: '/logos/parceiros/move.png'
  },

  // 🤝 COMUNIDADE
  {
    id: 'whatsapp',
    title: 'Grupo WhatsApp INTERBOX',
    description: 'Entre na comunidade oficial do INTERBOX 2025',
    url: 'https://chat.whatsapp.com/FHTqm0l36kc7RWYWMw1Kiz',
    icon: '🤝',
    category: 'comunidade',
    color: 'from-green-500 to-green-700',
    external: true
  }
];

const CATEGORIES = {
  inscricoes: { title: '🎟️ Inscrições', icon: '🎟️' },
  apoiadores: { title: '💪 APOIO', icon: '💪' },
  comunidade: { title: '🤝 Comunidade', icon: '🤝' }
};

export default function LinksPage() {
  const handleLinkClick = (link: LinkItem) => {
    // Não executar se o link estiver inativo
    if (link.inactive) {
      return;
    }
    
    // Analytics tracking (simples)
    console.log(`Link clicked: ${link.id} -> ${link.url}`);
    
    if (link.external) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = link.url;
    }
  };

  const groupedLinks = React.useMemo(() => {
    const groups: Record<string, LinkItem[]> = {};
    Object.keys(CATEGORIES).forEach(category => {
      groups[category] = LINKS.filter(link => link.category === category);
    });
    return groups;
  }, []);

  return (
    <>
      <SEOHead 
        title="Links INTERBØX 2025"
        description="Todos os links importantes em um só lugar. Encontre inscrições, redes sociais, contato e muito mais do INTERBØX 2025."
      />
      
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Hero Section com Glassmorphism */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          {/* Background Effects Refinados */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
            {/* Logo com Glassmorphism */}
            <div className="mb-8 flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                  <img 
                    src="/logos/nome_hrz.png" 
                    alt="CERRADO INTERBØX" 
                    className="h-24 md:h-32 w-auto object-contain"
                  />
                </div>
              </div>
            </div>
            
            {/* Título com Glassmorphism */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl blur-lg" />
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Links INTERBØX 2025
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Todos os links importantes em um só lugar. Encontre inscrições, redes sociais, 
                  contato e muito mais do INTERBØX 2025.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Links Grid com Design iOS Refinado */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 pb-20">
          <div className="space-y-16">
            {Object.entries(groupedLinks).map(([category, links], categoryIndex) => (
              <div
                key={category}
                className="space-y-8 animate-fade-in"
                style={{
                  animationDelay: `${categoryIndex * 200}ms`
                }}
              >
                {/* Cabeçalho da Categoria com Glassmorphism */}
                <div className="text-center relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl blur-lg" />
                  <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                      {CATEGORIES[category as keyof typeof CATEGORIES].title}
                    </h2>
                    <div className="w-32 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full shadow-lg" />
                  </div>
                </div>

                {/* Grid de Links Refinado */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {links.map((link, linkIndex) => (
                    <div
                      key={link.id}
                      className="group animate-fade-in"
                      style={{
                        animationDelay: `${(categoryIndex * 200) + (linkIndex * 100)}ms`
                      }}
                    >
                      <button
                        onClick={() => handleLinkClick(link)}
                        disabled={link.inactive}
                        className={`w-full relative overflow-hidden transition-all duration-500 transform hover:scale-105 ${
                          link.inactive 
                            ? 'cursor-not-allowed opacity-60' 
                            : 'cursor-pointer hover:-translate-y-2'
                        }`}
                      >
                        {/* Background Glassmorphism */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl" />
                        
                        {/* Efeito de Brilho */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        
                        {/* Conteúdo */}
                        <div className="relative z-10 p-8 rounded-3xl">
                          {/* Header do Card */}
                          <div className="flex items-center justify-between mb-6">
                            {link.logo ? (
                              <div className="relative">
                                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-sm" />
                                <img 
                                  src={link.logo} 
                                  alt={link.title}
                                  className="relative h-12 w-auto object-contain"
                                />
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-sm" />
                                <span className="relative text-4xl">{link.icon}</span>
                              </div>
                            )}
                            {link.external && !link.inactive && (
                              <div className="relative">
                                <div className="absolute inset-0 bg-white/10 rounded-full blur-sm" />
                                <span className="relative text-lg opacity-80 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                  ↗
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Título e Descrição */}
                          <h3 className="text-2xl font-bold mb-4 text-left text-white leading-tight">
                            {link.title}
                          </h3>
                          
                          <p className="text-base opacity-90 text-left leading-relaxed text-gray-200">
                            {link.description}
                          </p>
                          
                          {/* Indicador de inativo */}
                          {link.inactive && (
                            <div className="mt-6 text-center">
                              <span className="text-sm bg-gray-600/50 text-gray-300 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-500/30">
                                Temporariamente Indisponível
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
} 
