import React from 'react';
import InteractiveMap from '../components/InteractiveMap';
import Header from '../components/Header';

export default function Mapa() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] py-8">
      <Header />
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Localização do Evento
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Descubra onde acontece o maior evento de times da América Latina e veja se você está no raio de alcance!
          </p>
        </div>

        <InteractiveMap 
          className="max-w-6xl mx-auto"
          showRadius={true}
          showNavigation={true}
          enableGeolocation={true}
        />

        {/* Regiões de Alcance - Informação discreta */}
        <div className="mt-16 text-center">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-gray-500 mb-3">Regiões de alcance do evento:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Goiás', 'Distrito Federal', 'Minas Gerais', 'Tocantins', 'Bahia'].map((region, index) => (
                <span key={region} className="text-xs text-gray-400 bg-gray-800/30 px-2 py-1 rounded-full">
                  {region}{index < 4 && ','}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
