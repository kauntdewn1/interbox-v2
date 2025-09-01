import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { TabOverlayConfig } from '../config/tabOverlayConfig'

interface TabComingSoonOverlayProps {
  children: ReactNode
  config?: TabOverlayConfig
  isActive?: boolean
  title?: string
  description?: string
  icon?: string
  className?: string
}

export function TabComingSoonOverlay({ 
  children, 
  config,
  isActive = true, 
  title = "Em Breve",
  description = "Esta funcionalidade estará disponível em breve",
  icon = "🚀",
  className = ""
}: TabComingSoonOverlayProps) {
  // Usar configuração se fornecida, senão usar props individuais
  const finalConfig = config || {
    isActive,
    title,
    description,
    icon
  }
  
  if (!finalConfig.isActive) {
    return <>{children}</>
  }

  return (
    <div className={`relative ${className}`}>
      {/* Conteúdo original (encoberto) */}
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>
      
      {/* Overlay Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.4, 
          ease: [0.4, 0, 0.2, 1] 
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative w-full h-full">
          {/* Backdrop Blur */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl" />
          
          {/* Glassmorphism Card */}
          <div className="relative h-full flex flex-col items-center justify-center p-8">
            {/* Icon Container */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-2xl mb-6"
            >
                          <span className="text-4xl">{finalConfig.icon}</span>
          </motion.div>
          
          {/* Title */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-3xl font-bold text-gray-800 mb-3 text-center"
          >
            {finalConfig.title}
          </motion.h2>
          
          {/* Description */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-lg text-gray-600 text-center max-w-md leading-relaxed"
          >
            {finalConfig.description}
          </motion.p>
            
            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="absolute bottom-4 left-4 w-2 h-2 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full animate-pulse"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute top-1/2 left-4 w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse"
            />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
