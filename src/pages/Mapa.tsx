import React from 'react';
import InteractiveMap from '../components/InteractiveMap';

export default function Mapa() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] py-8">
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

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Regiões de Alcance</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {['Goiás', 'Distrito Federal', 'Minas Gerais', 'Tocantins', 'Bahia'].map((region) => (
              <div key={region} className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-pink-500 text-2xl mb-2">📍</div>
                <p className="text-white font-medium">{region}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
