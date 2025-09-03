import React from 'react';
import SEOHead from '../components/SEOHead';
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
    color: 'from-blue-500 to-blue-600',
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
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section - Design iOS-like */}
        <section className="relative h-[45vh] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/images/topo_links.webp"
              alt="INTERBØX 2025"
              className="w-full h-full object-cover"
            />
            {/* Overlay suave para iOS */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
          </div>

          {/* Conteúdo do Hero - Estilo iOS */}
          <div className="relative z-10 h-full flex flex-col justify-end p-6">
            {/* Card de perfil - Design iOS com sombra */}
            <div className="bg-white/95 ios-backdrop rounded-2xl p-4 mb-4 max-w-sm shadow-ios-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-ios">
                  <img
                    src="/logos/oficial_logo.png"
                    alt="INTERBØX"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <img
                    src="/logos/nome_hrz.png"
                    alt="INTERBØX 2025"
                    className="h-7 w-auto object-contain mb-1"
                  />
                  <p className="ios-subtitle text-sm font-medium">Maior Evento de Times da América Latina</p>
                </div>
              </div>
            </div>

            {/* Slogan motivacional - Tipografia iOS */}
            <div className="mb-4">
              <p className="text-lg text-white font-semibold max-w-2xl leading-relaxed">
                ᴄᴏᴍᴘᴇᴛɪçãᴏ. ᴄᴏᴍᴜɴɪᴅᴀᴅᴇ. ᴘʀᴏᴘóꜱɪᴛᴏ.
              </p>
            </div>
          </div>
        </section>

        {/* Links Section - Design iOS-like */}
        <section className="bg-gray-50 p-6 -mt-8 relative z-20">
          <div className="max-w-2xl mx-auto">
            {/* Título da seção - Estilo iOS */}
            <div className="text-center mb-8">
              <h2 className="ios-title text-2xl mb-2">
                Links Importantes
              </h2>
              <p className="ios-subtitle text-base">
                Acesse todos os recursos do INTERBØX 2025
              </p>
            </div>

            {/* Grid de Links em Cards - Design iOS */}
            <div className="ios-spacing">
              {Object.entries(groupedLinks).map(([category, links]) => (
                <div key={category} className="space-y-3">
                  {/* Cabeçalho da categoria - Estilo iOS */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 rounded-lg ios-gradient-blue flex items-center justify-center shadow-ios">
                      <span className="text-white text-sm font-semibold">
                        {CATEGORIES[category as keyof typeof CATEGORIES].icon}
                      </span>
                    </div>
                    <h3 className="ios-title text-lg">
                      {CATEGORIES[category as keyof typeof CATEGORIES].title}
                    </h3>
                  </div>
                  
                  {/* Cards dos links - Design iOS */}
                  <div className="space-y-3">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className="ios-card-hover p-4 cursor-pointer group"
                        onClick={() => handleLinkClick(link)}
                      >
                        <div className="flex items-center space-x-4">
                          {/* Thumbnail/Ícone - Estilo iOS */}
                          <div className="w-14 h-14 rounded-xl ios-gradient-light flex items-center justify-center shadow-ios">
                            {link.logo ? (
                              <img
                                src={link.logo}
                                alt={link.title}
                                className="w-8 h-8 object-contain"
                              />
                            ) : (
                              <span className="text-2xl">{link.icon}</span>
                            )}
                          </div>
                          
                          {/* Conteúdo - Espaçamento iOS */}
                          <div className="flex-1 min-w-0">
                            <h4 className="ios-title text-base mb-1 truncate">
                              {link.title}
                            </h4>
                            <p className="ios-subtitle text-sm leading-relaxed line-clamp-2">
                              {link.description}
                            </p>
                          </div>
                          
                          {/* Botão de ação - Touch target iOS */}
                          <div className="ios-button-primary w-11 h-11 flex items-center justify-center group-hover:scale-105">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
} 
