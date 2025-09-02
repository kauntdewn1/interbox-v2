import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const BottomTabBar = () => {
  const location = useLocation();

  const tabs = [
    {
      id: 'home',
      label: 'Início',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: '/',
      description: 'Principal'
    },
    {
      id: 'sobre',
      label: 'Sobre',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/sobre',
      description: 'Evento'
    },
    {
      id: 'patrocinadores',
      label: 'Patrocinadores',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      path: '/patrocinadores',
      description: 'Seja um'
    },
    {
      id: 'audiovisual',
      label: 'Audiovisual',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      path: 'https://interbox-captacao.netlify.app/audiovisual',
      description: 'Captação',
      external: true
    },
    {
      id: 'judges-staff',
      label: 'Judges',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
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
