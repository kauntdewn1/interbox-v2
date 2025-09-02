import React from 'react';
import SEOHead from '../components/SEOHead';

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
      
      <div className="min-h-screen bg-black">
        {/* Hero Section - Otimizado para iOS */}
        <section className="relative h-[40vh] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src="/images/topo_links.webp"
              alt="INTERBØX 2025"
              className="w-full h-full object-cover"
            />
            {/* Overlay escuro para melhor legibilidade */}
            <div className="absolute inset-0 bg-black/60" />
          </div>

          {/* Conteúdo do Hero - Ultra compacto para iOS */}
          <div className="relative z-10 h-full flex flex-col justify-end p-3">
            {/* Card de perfil sobreposto - Mínimo */}
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 mb-2 max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                  <img
                    src="/logos/oficial_logo.png"
                    alt="INTERBØX"
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm">INTERBØX 2025</h3>
                  <p className="text-gray-300 text-xs">Maior Evento de Times da América Latina</p>
                </div>
              </div>
            </div>

            {/* Slogan motivacional - Ultra compacto */}
            <div className="mb-2">
              <p className="text-base text-gray-200 max-w-2xl">
              ᴄᴏᴍᴘᴇᴛɪçãᴏ. ᴄᴏᴍᴜɴɪᴅᴀᴅᴇ. ᴘʀᴏᴘóꜱɪᴛᴏ.
              </p>
            </div>
          </div>
        </section>

        {/* Links Section - Máximo aproveitamento do espaço iOS */}
        <section className="bg-black p-3">
          <div className="max-w-4xl mx-auto">
            {/* Título da seção - Mínimo */}
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-white mb-1">
                Links Importantes
              </h2>
              <p className="text-gray-400 text-xs">
                Acesse todos os recursos do INTERBØX 2025
              </p>
            </div>

            {/* Grid de Links em Cards Verticais - Ultra compactos */}
            <div className="space-y-1 mb-3">
              {Object.entries(groupedLinks).map(([category, links]) => (
                <div key={category} className="space-y-1">
                  {/* Cabeçalho da categoria - Mínimo */}
                  <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                    <span className="text-lg">{CATEGORIES[category as keyof typeof CATEGORIES].icon}</span>
                    <span>{CATEGORIES[category as keyof typeof CATEGORIES].title}</span>
                  </h3>
                  
                  {/* Cards dos links - Ultra compactos */}
                  <div className="space-y-1">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-2 hover:bg-gray-800/80 transition-all duration-300 cursor-pointer group"
                        onClick={() => handleLinkClick(link)}
                      >
                        <div className="flex items-center space-x-2">
                          {/* Thumbnail/Ícone - Mínimo */}
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                            {link.logo ? (
                              <img
                                src={link.logo}
                                alt={link.title}
                                className="w-6 h-6 object-contain"
                              />
                            ) : (
                              <span className="text-lg">{link.icon}</span>
                            )}
                          </div>
                          
                          {/* Conteúdo - Ultra compacto */}
                          <div className="flex-1">
                            <h4 className="text-white font-semibold text-sm mb-0.5">
                              {link.title}
                            </h4>
                            <p className="text-gray-400 text-xs leading-tight">
                              {link.description}
                            </p>
                          </div>
                          
                          {/* Botão Play - Mínimo */}
                          <button className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors group-hover:scale-110">
                            <span className="text-white text-xs">▶</span>
                          </button>
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
    </>
  );
} 
