import Header from '../components/Header'
import Hero from '../components/Hero';

import GamifiedLeaderboard from '../components/GamifiedLeaderboard';
import Liner from '../components/Liner';
import Footer from '../components/Footer';
import EcommerceSimulation from '../components/EcommerceSimulation';
import useAuth from '../hooks/useAuth';
import Parceiros from '../components/Parceiros'; 

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="relative pt-24">
               
        {/* Hero Section */}
        <Hero />

        {/* 🏆 ARENA DOS CONSAGRADOS - Gamificação Unificada */}
        <section className="bg-gradient-to-br from-black via-[#0a0a1a] to-[#0038d0] relative overflow-hidden">
          {/* Background Pattern da INTERBØX */}
          <div className="absolute inset-0 bg-[url('/images/bg_main.png')] bg-cover bg-center opacity-20"></div>
          
          <div className="container mx-auto px-4 py-16 relative z-10">
            <GamifiedLeaderboard />
            {!user && (
              <div className="text-center mt-4">
                <p className="text-gray-400">Faça login para participar da Arena dos Consagrados!</p>
              </div>
            )}
          </div>
        </section>

        <Liner />

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