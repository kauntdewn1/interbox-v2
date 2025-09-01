import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import GamifiedCTA from "./GamifiedCTA.tsx"

export default function Hero() {
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 })

  // Spotlight segue giroscópio (mobile) + mouse (desktop fallback)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      const x = (e.clientX / innerWidth) * 100
      const y = (e.clientY / innerHeight) * 100
      setSpotlight({ x, y })
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma && e.beta) {
        const x = 50 + e.gamma * 1.2
        const y = 50 + e.beta * 0.8
        setSpotlight({ x, y })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("deviceorientation", handleOrientation)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("deviceorientation", handleOrientation)
    }
  }, [])

  return (
    <section className="relative min-h-[55vh] md:min-h-[60vh] flex flex-col justify-center items-center text-center px-6 text-white overflow-hidden">
      {/* BG base */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/bg_rounded.png)" }}
      />

      {/* Spotlight dinâmico */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${spotlight.x}% ${spotlight.y}%, rgba(251,5,228,0.35), transparent 60%)`,
          transition: "background 0.2s ease-out",
        }}
      />

      {/* Overlay preto leve */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Logo com efeito "respiração digital" */}
        <motion.img
          src="/logos/oficial_logo.png"
          alt="Logo Oficial"
          className="w-80 h-80 md:w-56 md:h-56 opacity-95"
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: [1, 1.05, 1], opacity: [1, 0.95, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bloco Headline + Subcopy (glass leve) */}
        <motion.div
          className="backdrop-blur-md bg-white/5 px-5 py-4 rounded-2xl shadow-lg border border-white/10 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <h1 className="text-2xl md:text-4xl font-extrabold leading-snug tracking-tight mb-2">
            <span className="text-pink-500">O MAIOR EVENTO</span>
            <br />
            DE TIMES DA AMÉRICA LATINA
          </h1>
          <p className="text-sm md:text-base text-gray-200">
            Competição. Comunidade. Propósito.
          </p>
        </motion.div>

        {/* CTA com pulse suave chamando o clique */}
        <motion.div
          className="w-full flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <motion.div
            className="backdrop-blur-xl bg-pink-500/20 border border-pink-400/40 rounded-xl shadow-xl w-full max-w-sm"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <GamifiedCTA
              href="https://chat.whatsapp.com/FHTqm0l36kc7RWYWMw1Kiz"
              tooltipText="O PORTAL ESTÁ ABERTO"
              className="px-8 py-3 text-base md:text-lg font-bold text-white w-full"
            >
              ACESSAR A COMUNIDADE
            </GamifiedCTA>
          </motion.div>
        </motion.div>

        {/* Datas/Local */}
        <motion.div
          className="text-gray-300 font-semibold backdrop-blur-sm bg-black/40 px-5 py-2 rounded-lg border border-white/10 mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          <p className="text-pink-400 text-base md:text-lg">
            24, 25 e 26 de OUTUBRO
          </p>
          <p className="text-xs md:text-sm">Goiânia Arena • Goiânia/GO</p>
        </motion.div>
      </div>
    </section>
  )
}
