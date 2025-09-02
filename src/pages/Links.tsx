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
    icon: '⍟',
    category: 'inscricoes',
    color: 'from-blue-500 to-cyan-600',
    external: true
  },
  {
    id: 'audiovisual',
    title: 'Candidatura Audiovisual',
    description: 'Seja fotógrafo, videomaker ou influencer oficial do INTERBØX 2025',
    url: 'https://interbox-captacao.netlify.app/audiovisual',
    icon: '⨂',
    category: 'inscricoes',
    color: 'from-gray-600 to-gray-800',
    external: true
  },
  {
    id: 'judge-staff',
    title: 'Cadastro Judge & Staff',
    description: 'Seja parte da equipe oficial do INTERBØX 2025 como juiz ou staff',
    url: 'https://interbox-captacao.netlify.app/captacao/judge-staff',
    icon: '⧖',
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
    icon: '⟠',
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
    icon: '◭',
    category: 'comunidade',
    color: 'from-green-500 to-green-700',
    external: true
  }
];

const CATEGORIES = {
  inscricoes: { title: '⍟ Inscrições', icon: '⍟' },
  apoiadores: { title: '⟠ APOIO', icon: '⟠' },
  comunidade: { title: '◭ Comunidade', icon: '◭' }
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
      
      <div className="min-h-screen bg-black">
        {/* Hero Section - Ocupa 2/3 da tela */}
        <section className="relative h-[66vh] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/images/topo_links.webp"
              alt="INTERBØX 2025"
              className="w-full h-full object-cover"
            />
            {/* Overlay escuro para melhor legibilidade */}
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Conteúdo do Hero */}
          <div className="relative z-10 h-full flex flex-col justify-end p-6">
            {/* Card de perfil sobreposto */}
            <div className="bg-black/80 backdrop-blur-sm rounded-2xl p-4 mb-6 max-w-xs">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                  <img
                    src="/logos/oficial_logo.png"
                    alt="INTERBØX"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg">INTERBØX 2025</h3>
                  <p className="text-gray-300 text-sm">Maior Evento de Times da América Latina</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors">
                  <span className="text-white text-lg">↗</span>
                </button>
              </div>
            </div>

            {/* Slogan motivacional */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Faça seu Corpo
                <br />
                <span className="text-orange-500">Mais Forte</span>
              </h1>
              <p className="text-xl text-gray-200 max-w-2xl">
                Conecte-se com a comunidade fitness mais vibrante da América Latina
              </p>
            </div>
          </div>
        </section>

        {/* Links Section - Ocupa 1/3 da tela */}
        <section className="bg-black p-6">
          <div className="max-w-4xl mx-auto">
            {/* Título da seção */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Links Importantes
              </h2>
              <p className="text-gray-400">
                Acesse todos os recursos do INTERBØX 2025
              </p>
            </div>

            {/* Grid de Links em Cards Verticais */}
            <div className="space-y-4 mb-8">
              {Object.entries(groupedLinks).map(([category, links]) => (
                <div key={category} className="space-y-3">
                  {/* Cabeçalho da categoria */}
                  <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <span className="text-2xl">{CATEGORIES[category as keyof typeof CATEGORIES].icon}</span>
                    <span>{CATEGORIES[category as keyof typeof CATEGORIES].title}</span>
                  </h3>
                  
                  {/* Cards dos links */}
                  <div className="space-y-3">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 hover:bg-gray-800/80 transition-all duration-300 cursor-pointer group"
                        onClick={() => handleLinkClick(link)}
                      >
                        <div className="flex items-center space-x-4">
                          {/* Thumbnail/Ícone */}
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                            {link.logo ? (
                              <img
                                src={link.logo}
                                alt={link.title}
                                className="w-10 h-10 object-contain"
                              />
                            ) : (
                              <span className="text-2xl">{link.icon}</span>
                            )}
                          </div>
                          
                          {/* Conteúdo */}
                          <div className="flex-1">
                            <h4 className="text-white font-semibold text-lg mb-1">
                              {link.title}
                            </h4>
                            <p className="text-gray-400 text-sm leading-relaxed">
                              {link.description}
                            </p>
                          </div>
                          
                          {/* Botão Play */}
                          <button className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors group-hover:scale-110">
                            <span className="text-white text-lg">▶</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Botão Call-to-Action Principal */}
            <div className="text-center">
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-4 px-8 rounded-2xl transition-colors duration-300 transform hover:scale-105">
                Acessar Todos os Links
              </button>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
} 
