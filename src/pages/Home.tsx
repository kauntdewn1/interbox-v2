import Header from '../components/Header'
import Hero from '../components/Hero';

import GamifiedLeaderboard from '../components/GamifiedLeaderboard';
import Liner from '../components/Liner';
import Footer from '../components/Footer';
import EcommerceSimulation from '../components/EcommerceSimulation';
import useAuth from '../hooks/useAuth';
import Parceiros from '../components/Parceiros';
import { RiCalendarView } from "react-icons/ri";
import { FaMapMarkerAlt } from "react-icons/fa";
import { LuMap } from "react-icons/lu"; 

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="relative pt-24">
               
        {/* Hero Section */}
        <Hero />

        {/* 🏆 ARENA DOS CONSAGRADOS - Gamificação Unificada */}
        {user ? (
          <section className="bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] relative overflow-hidden">
            {/* Background Pattern da INTERBØX */}
            <div className="absolute inset-0 bg-[url('/images/bg_main.png')] bg-cover bg-center opacity-20"></div>
            
            <div className="container mx-auto px-4 py-16 relative z-10">
              <GamifiedLeaderboard />
            </div>
          </section>
        ) : (
          <section className="bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] relative overflow-hidden">
            {/* Background Pattern da INTERBØX */}
            <div className="absolute inset-0 bg-[url('/images/bg_main.png')] bg-cover bg-center opacity-20"></div>
            
            <div className="container mx-auto px-4 py-16 relative z-10">
              <div className="text-center">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 max-w-2xl mx-auto">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Arena dos Consagrados
                  </h2>
                  <p className="text-gray-300 mb-6">
                    Faça login para participar da competição e ver o ranking em tempo real!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => window.location.href = '/login'}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Fazer Login
                    </button>
                    <button 
                      onClick={() => window.location.href = '/cadastro'}
                      className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 border border-white/20"
                    >
                      Criar Conta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <Liner />
        {/* Localização do Evento */}
        <section className="bg-gradient-to-br from-gray-900 via-black to-gray-900 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Onde Acontece o <span className="text-pink-500">CERRADO INTERBØX</span>
              </h2>
              <p className="text-md text-gray-300 max-w-2xl mx-auto">
                Descubra a localização do maior evento de times da América Latina e veja se você está no raio de alcance!
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="space-y-2 text-sm text-gray-400">
                      <p className="flex items-center gap-2"><RiCalendarView className="text-pink-500" /> <strong>Data:</strong> 24, 25 e 26 de outubro de 2025</p>
                      <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-pink-500" /> <strong>Local:</strong> Goiânia Arena - Goiânia/GO</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <a
                      href="/mapa"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-300 font-semibold"
                    >
                      <LuMap className="text-xl" />
                      <span>Ver Mapa Interativo</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* E-commerce Simulation Section */}
        <section>
          <EcommerceSimulation />
        </section>

        {/* Parceiros Section */}
        <section>
          <div className="container mx-auto px-4 py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
              Nossos <span className="text-pink-500">Parceiros</span>
            </h2>
            <Parceiros />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 