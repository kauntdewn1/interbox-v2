import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  InformationCircleIcon, 
  CurrencyDollarIcon, 
  VideoCameraIcon, 
  UsersIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const BottomTabBar = () => {
  const location = useLocation();

  const tabs = [
    {
      id: 'home',
      label: 'Início',
      icon: <HomeIcon className="w-6 h-6" />,
      path: '/',
      description: 'Principal'
    },
    {
      id: 'sobre',
      label: 'Sobre',
      icon: <InformationCircleIcon className="w-6 h-6" />,
      path: '/sobre',
      description: 'Evento'
    },
    {
      id: 'patrocinadores',
      label: 'Patrocinadores',
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
      path: '/patrocinadores',
      description: 'Seja um'
    },

    {
      id: 'audiovisual',
      label: 'Audiovisual',
      icon: <VideoCameraIcon className="w-6 h-6" />,
      path: 'https://interbox-captacao.netlify.app/audiovisual',
      description: 'Captação',
      external: true
    },
    {
      id: 'judges-staff',
      label: 'Judges',
      icon: <UsersIcon className="w-6 h-6" />,
      path: 'https://interbox-captacao.netlify.app/captacao/judge-staff',
      description: '& Staff',
      external: true
    }
  ];

  const isActive = (path: string) => {
    // Links externos nunca são ativos
    if (path.startsWith('http')) {
      return false;
    }
    
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="ios-bottom-tab-bar">
      <div className="ios-tab-content">
        {tabs.map((tab) => (
          tab.external ? (
            <a
              key={tab.id}
              href={tab.path}
              target="_blank"
              rel="noopener noreferrer"
              className="ios-tab-item"
            >
              <div className="ios-tab-icon-container">
                {tab.icon}
              </div>
              <span className="ios-tab-label">{tab.label}</span>
              <span className="ios-tab-description">{tab.description}</span>
            </a>
          ) : (
            <Link
              key={tab.id}
              to={tab.path}
              className={`ios-tab-item ${isActive(tab.path) ? 'active' : ''}`}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="ios-tab-icon-container">
                {tab.icon}
              </div>
              <span className="ios-tab-label">{tab.label}</span>
              <span className="ios-tab-description">{tab.description}</span>
            </Link>
          )
        ))}
      </div>
      
      {/* Indicador da aba ativa */}
      <div className="ios-tab-indicator" />
    </div>
  );
};

export default BottomTabBar;
