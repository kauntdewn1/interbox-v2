export default function Sobre() {
  return (
    <div>
      <section
        id="sobre"
        className="relative py-20 px-6 md:px-16 text-white"
        style={{
          backgroundImage: "url(/images/bg_1.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              🔥 CERRADO INTERBØX 2025
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 uppercase tracking-wide">
              SOBRE O EVENTO
            </h2>
          </div>

          <div className="text-lg md:text-xl leading-relaxed mb-12 text-center">
            <p className="text-gray-300 leading-relaxed mb-6">
              O Interbøx nasceu da vontade de levar o espírito do fitness além das paredes dos boxes. Desde sua primeira edição, a competição cresceu impulsionada por um propósito simples: celebrar a força coletiva, a superação e a cultura da comunidade. Hoje, o evento é referência na América Latina, atraindo atletas de elite e amadores de todo o continente.
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-16">
            <h3 className="text-2xl font-bold mb-4 text-center">🥇 Nossa História</h3>
            <p className="text-lg leading-relaxed text-center">
              O Interbøx nasceu da vontade de levar o espírito do fitness além das paredes dos boxes. Desde sua primeira edição, a competição cresceu impulsionada por um propósito simples: celebrar a força coletiva, a superação e a cultura da comunidade. Hoje, o evento é referência na América Latina, atraindo atletas de elite e amadores de todo o continente.
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-16">
            <h3 className="text-2xl font-bold mb-4 text-center">🔭 O Que Esperar em 2025</h3>
            <ul className="text-lg leading-relaxed list-disc pl-5 space-y-2">
              <li>Arena de elite com estrutura profissional e atmosfera gamer</li>
              <li>Três dias de competição intensa</li>
              <li>Mais de 6.000 pessoas reunidas</li>
              <li>Tokens simbólicos ($BOX), rankings ao vivo e app integrado</li>
              <li>Ativações inéditas, praça de alimentação e área recovery</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-4 text-center">📅 Informações Gerais</h3>
              <div className="space-y-3 text-left">
                <p><strong>📍 Data:</strong> 24, 25 e 26 de outubro de 2025</p>
                <p><strong>📍 Local:</strong> Goiânia Arena – Goiânia/GO</p>
                <p><strong>👥 Público estimado:</strong> 6.000 pessoas</p>
                <p><strong>💪 Times participantes:</strong> 100</p>
                <p><strong>🏋️‍♀️ Atletas previstos:</strong> +1.000</p>
                <p><strong>🏷️ Box participantes:</strong> +100 afiliados</p>
              </div>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-4 text-center">🏟️ Estrutura da Arena</h3>
              <ul className="space-y-2 text-left list-disc pl-5">
                <li>Arena externa e interna</li>
                <li>Espaço recovery</li>
                <li>Training Center</li>
                <li>Espaço pet</li>
                <li>Praça de alimentação</li>
                <li>Expositores, lojas e muito mais</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-600/20 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-4">🌐 Plataforma de Visibilidade</h3>
              <p className="text-lg leading-relaxed">
                O evento também é uma plataforma de visibilidade para marcas e patrocinadores, com oportunidades de exposição digital e física, geração de negócios, e ações diretamente com o público-alvo.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="group bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/10 transition duration-300">
              <img
                src="/images/rodrigo.webp"
                alt="Rodrigo Bittencourt"
                className="rounded-full shadow-md w-48 h-48 object-cover mx-auto mb-4 transition-transform duration-300 group-hover:scale-105"
              />
              <h4 className="text-xl font-semibold text-center mb-2">Rodrigo Bittencourt</h4>
              <p className="text-sm text-center leading-relaxed opacity-80">
                🎓 <strong>Formação e Especializações:</strong><br />
                • Head Coach da Avanti <br />
                • Level 1 Trainer – Fitness 🇦🇷🇺🇸 <br />
                • Especialista em Treinamento Funcional <br />
                • Coach de Atletas de Elite <br />
                • Especialista em Biomecânica <br />
                • Especialista em Nutrição Esportiva <br />
                • Especialista em Psicologia do Esporte
              </p>
            </div>

            <div className="group bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/10 transition duration-300">
              <img
                src="/images/rafael.webp"
                alt="Rafael Bittencourt"
                className="rounded-full shadow-md w-48 h-48 object-cover mx-auto mb-4 transition-transform duration-300 group-hover:scale-105"
              />
              <h4 className="text-xl font-semibold text-center mb-2">Rafael Bittencourt</h4>
              <p className="text-sm text-center leading-relaxed opacity-80">
                🎓 <strong>Formação e Especializações:</strong><br />
                • Head Coach da Avanti <br />
                • Level 1 Trainer – Fitness 🇦🇷🇺🇸 <br />
                • Especialista em Treinamento Funcional <br />
                • Coach de Atletas de Elite <br />
                • Especialista em Biomecânica <br />
                • Especialista em Nutrição Esportiva <br />
                • Especialista em Psicologia do Esporte
              </p>
            </div>

            <div className="group bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/10 transition duration-300">
              <img
                src="/images/thiago.webp"
                alt="Thiago Bittencourt"
                className="rounded-full shadow-md w-48 h-48 object-cover mx-auto mb-4 transition-transform duration-300 group-hover:scale-105"
              />
              <h4 className="text-xl font-semibold text-center mb-2">Thiago Bittencourt</h4>
              <p className="text-sm text-center leading-relaxed opacity-80">
                🎓 <strong>Formação e Especializações:</strong><br />
                • Head Coach da Avanti <br />
                • Level 1 Trainer – Fitness 🇦🇷🇺🇸 <br />
                • Especialista em Treinamento Funcional <br />
                • Coach de Atletas de Elite <br />
                • Especialista em Biomecânica <br />
                • Especialista em Nutrição Esportiva <br />
                • Especialista em Psicologia do Esporte
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
