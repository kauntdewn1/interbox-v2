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
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-blue-500/10" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
            <div className="mb-6 flex justify-center">
              <img 
                src="/logos/nome_hrz.png" 
                alt="CERRADO INTERBØX" 
                className="h-24 md:h-32 w-auto object-contain"
              />
            </div>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Todos os links importantes em um só lugar. Encontre inscrições, redes sociais, 
              contato e muito mais do INTERBØX 2025.
            </p>
          </div>
        </section>

        {/* Links Grid */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 pb-20">
          <div className="space-y-12">
            {Object.entries(groupedLinks).map(([category, links], categoryIndex) => (
              <div
                key={category}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {CATEGORIES[category as keyof typeof CATEGORIES].title}
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-purple-500 mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {links.map((link, linkIndex) => (
                    <div
                      key={link.id}
                      className="transition-all duration-300"
                    >
                      <button
                        onClick={() => handleLinkClick(link)}
                        disabled={link.inactive}
                        className={`w-full p-6 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                          link.inactive 
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60' 
                            : `bg-gradient-to-br ${link.color} text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 group`
                        }`}
                      >
                        {/* Background Effect - apenas se não estiver inativo */}
                        {!link.inactive && (
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        )}
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            {link.logo ? (
                              <img 
                                src={link.logo} 
                                alt={link.title}
                                className="h-8 w-auto object-contain"
                              />
                            ) : (
                              <span className="text-3xl">{link.icon}</span>
                            )}
                            {link.external && !link.inactive && (
                              <span className="text-sm opacity-80">↗</span>
                            )}
                          </div>
                          
                          <h3 className="text-xl font-bold mb-2 text-left">
                            {link.title}
                          </h3>
                          
                          <p className="text-sm opacity-90 text-left leading-relaxed">
                            {link.description}
                          </p>
                          
                          {/* Indicador de inativo */}
                          {link.inactive && (
                            <div className="mt-3 text-center">
                              <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
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
